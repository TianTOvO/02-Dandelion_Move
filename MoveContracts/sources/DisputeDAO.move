address dandelion {
module DisputeDAO {
    use std::signer;
    use std::vector;
    use std::option;

    /// 仲裁员结构体
    struct Juror has copy, drop, store {
        addr: address,
        stake_amount: u64,
        is_active: bool,
    }

    /// 全局状态
    struct DisputeDAOState has key {
        jurors: vector<address>,
        juror_index: vector<address>,
        active_jurors: vector<Juror>,
        dispute_jurors: vector<vector<address>>,
        has_voted: vector<vector<bool>>,
        votes: vector<vector<address>>,
        vote_count: vector<u64>,
        candidate_votes: vector<vector<u64>>,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, DisputeDAOState {
            jurors: vector::empty<address>(),
            juror_index: vector::empty<address>(),
            active_jurors: vector::empty<Juror>(),
            dispute_jurors: vector::empty<vector<address>>(),
            has_voted: vector::empty<vector<bool>>(),
            votes: vector::empty<vector<address>>(),
            vote_count: vector::empty<u64>(),
            candidate_votes: vector::empty<vector<u64>>(),
        });
    }

    /// 用户成为仲裁员，需要质押代币
    public entry fun stake_as_juror(owner: &signer, stake_amount: u64) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let sender = signer::address_of(owner);
        let i = 0;
        let len = vector::length(&state.juror_index);
        while (i < len) {
            if (*vector::borrow(&state.juror_index, i) == sender) {
                return // 已经是仲裁员
            };
            i = i + 1;
        };
        vector::push_back(&mut state.jurors, sender);
        vector::push_back(&mut state.juror_index, sender);
        vector::push_back(&mut state.active_jurors, Juror { addr: sender, stake_amount, is_active: true });
    }

    /// 仲裁员解除质押
    public entry fun unstake_juror(owner: &signer) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let sender = signer::address_of(owner);
        let i = 0;
        let len = vector::length(&state.juror_index);
        while (i < len) {
            if (*vector::borrow(&state.juror_index, i) == sender) {
                let juror = vector::borrow_mut(&mut state.active_jurors, i);
                juror.is_active = false;
                return
            };
            i = i + 1;
        };
    }

    /// 开始争议，随机选择仲裁员
    public entry fun start_dispute(owner: &signer, dispute_id: u64, task_id: u64, num_jurors: u64) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let len = vector::length(&state.dispute_jurors);
        if (dispute_id >= len) {
            let i = len;
            while (i <= dispute_id) {
                vector::push_back(&mut state.dispute_jurors, vector::empty<address>());
                vector::push_back(&mut state.has_voted, vector::empty<bool>());
                vector::push_back(&mut state.votes, vector::empty<address>());
                vector::push_back(&mut state.vote_count, 0);
                vector::push_back(&mut state.candidate_votes, vector::empty<u64>());
                i = i + 1;
            };
        };
        let selected = vector::empty<address>();
        let active_count = 0;
        let i = 0;
        let jurors_len = vector::length(&state.active_jurors);
        while (i < jurors_len && active_count < num_jurors) {
            let juror = vector::borrow(&state.active_jurors, i);
            if (juror.is_active) {
                vector::push_back(&mut selected, juror.addr);
                active_count = active_count + 1;
            };
            i = i + 1;
        };
        *vector::borrow_mut(&mut state.dispute_jurors, dispute_id) = selected;
    }

    /// 仲裁员投票
    public entry fun vote(owner: &signer, dispute_id: u64, vote_for: address) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let sender = signer::address_of(owner);
        let jurors = vector::borrow(&state.dispute_jurors, dispute_id);
        let i = 0;
        let jurors_len = vector::length(jurors);
        while (i < jurors_len) {
            if (*vector::borrow(jurors, i) == sender) {
                let j = 0;
                let has_voted_vec = vector::borrow(&state.has_voted, dispute_id);
                let has_voted_len = vector::length(has_voted_vec);
                while (j < has_voted_len) {
                    if (*vector::borrow(has_voted_vec, j)) {
                        return // 已经投过票
                    };
                    j = j + 1;
                };
                let votes_vec = vector::borrow_mut(&mut state.votes, dispute_id);
                vector::push_back(votes_vec, vote_for);
                let has_voted_vec_mut = vector::borrow_mut(&mut state.has_voted, dispute_id);
                vector::push_back(has_voted_vec_mut, true);
                let vote_count_ref = vector::borrow_mut(&mut state.vote_count, dispute_id);
                *vote_count_ref = *vote_count_ref + 1;
                let candidate_votes_vec = vector::borrow_mut(&mut state.candidate_votes, dispute_id);
                let k = 0;
                let candidate_len = vector::length(candidate_votes_vec);
                while (k < candidate_len) {
                    if (*vector::borrow(candidate_votes_vec, k) == 0) {
                        let candidate_vote_ref = vector::borrow_mut(candidate_votes_vec, k);
                        *candidate_vote_ref = *candidate_vote_ref + 1;
                        break
                    };
                    k = k + 1;
                };
                return
            };
            i = i + 1;
        };
    }

    /// 解决争议，确定获胜者
    public entry fun resolve_dispute(owner: &signer, dispute_id: u64) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let candidate_votes_vec = vector::borrow(&state.candidate_votes, dispute_id);
        let max_votes = 0;
        let winner = @0x0;
        let i = 0;
        let len = vector::length(candidate_votes_vec);
        while (i < len) {
            let votes = *vector::borrow(candidate_votes_vec, i);
            if (votes > max_votes) {
                max_votes = votes;
                let votes_vec = vector::borrow(&state.votes, dispute_id);
                if (i < vector::length(votes_vec)) {
                    winner = *vector::borrow(votes_vec, i);
                };
            };
            i = i + 1;
        };
    }

    /// 处理恶意任务，奖励参与仲裁的仲裁员
    public entry fun resolve_malicious_task(owner: &signer, task_id: u64) acquires DisputeDAOState {
        let state = borrow_global_mut<DisputeDAOState>(@dandelion);
        let jurors = vector::borrow(&state.dispute_jurors, task_id);
        // 处理恶意任务的逻辑
    }

    /// Getter 函数
    public fun get_dispute_jurors(owner: address, dispute_id: u64): vector<address> acquires DisputeDAOState {
        let state = borrow_global<DisputeDAOState>(@dandelion);
        *vector::borrow(&state.dispute_jurors, dispute_id)
    }

    public fun get_juror(owner: address, juror_addr: address): option::Option<Juror> acquires DisputeDAOState {
        let state = borrow_global<DisputeDAOState>(@dandelion);
        let i = 0;
        let len = vector::length(&state.juror_index);
        while (i < len) {
            if (*vector::borrow(&state.juror_index, i) == juror_addr) {
                return option::some(*vector::borrow(&state.active_jurors, i))
            };
            i = i + 1;
        };
        option::none<Juror>()
    }

    public fun get_active_jurors(owner: address): vector<address> acquires DisputeDAOState {
        let state = borrow_global<DisputeDAOState>(@dandelion);
        let actives = vector::empty<address>();
        let i = 0;
        let len = vector::length(&state.active_jurors);
        while (i < len) {
            let juror = vector::borrow(&state.active_jurors, i);
            if (juror.is_active) {
                vector::push_back(&mut actives, *vector::borrow(&state.juror_index, i));
            };
            i = i + 1;
        };
        actives
    }

    /// 辅助函数
    fun find_juror_index(indexes: &vector<address>, addr: address): u64 {
        let i = 0;
        let len = vector::length(indexes);
        while (i < len) {
            if (*vector::borrow(indexes, i) == addr) {
                return i
            };
            i = i + 1;
        };
        0
    }
}
}
