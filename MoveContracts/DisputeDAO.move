module DisputeDAO {
    use std::signer;
    use std::vector;
    use std::option;
    use std::address;
    use std::event;

    /// 仲裁员结构体
    struct Juror has copy, drop, store {
        addr: address,
        stake_amount: u64,
        is_active: bool,
        last_dispute_id: u64,
    }

    /// 事件定义
    struct JurorStakedEvent has drop, store {
        juror: address,
        amount: u64,
    }
    struct JurorUnstakedEvent has drop, store {
        juror: address,
        amount: u64,
    }
    struct DisputeStartedEvent has drop, store {
        dispute_id: u64,
        jurors: vector::Vector<address>,
    }
    struct VotedEvent has drop, store {
        dispute_id: u64,
        juror: address,
        winner: address,
    }
    struct DisputeResolvedEvent has drop, store {
        dispute_id: u64,
        winner: address,
    }
    struct MaliciousTaskResolvedEvent has drop, store {
        dispute_id: u64,
        jurors: vector::Vector<address>,
    }

    /// DAO全局状态
    struct DisputeDAOState has key {
        jurors: vector::Vector<Juror>,
        juror_index: vector::Vector<address>,
        min_stake: u64,
        jurors_per_dispute: u64,
        juror_cooldown: u64,
        dispute_jurors: vector::Vector<vector::Vector<address>>,
        has_voted: vector::Vector<vector::Vector<bool>>,
        votes: vector::Vector<vector::Vector<address>>,
        vote_count: vector::Vector<u64>,
        candidate_votes: vector::Vector<vector::Vector<u64>>,
        event_handle_stake: event::EventHandle<JurorStakedEvent>,
        event_handle_unstake: event::EventHandle<JurorUnstakedEvent>,
        event_handle_dispute: event::EventHandle<DisputeStartedEvent>,
        event_handle_vote: event::EventHandle<VotedEvent>,
        event_handle_resolve: event::EventHandle<DisputeResolvedEvent>,
        event_handle_malicious: event::EventHandle<MaliciousTaskResolvedEvent>,
    }

    /// 初始化
    public entry fun init(owner: &signer, min_stake: u64, jurors_per_dispute: u64, juror_cooldown: u64) {
        move_to(owner, DisputeDAOState {
            jurors: vector::empty<Juror>(),
            juror_index: vector::empty<address>(),
            min_stake,
            jurors_per_dispute,
            juror_cooldown,
            dispute_jurors: vector::empty<vector::Vector<address>>(),
            has_voted: vector::empty<vector::Vector<bool>>(),
            votes: vector::empty<vector::Vector<address>>(),
            vote_count: vector::empty<u64>(),
            candidate_votes: vector::empty<vector::Vector<u64>>(),
            event_handle_stake: event::new_event_handle<JurorStakedEvent>(signer::address_of(owner)),
            event_handle_unstake: event::new_event_handle<JurorUnstakedEvent>(signer::address_of(owner)),
            event_handle_dispute: event::new_event_handle<DisputeStartedEvent>(signer::address_of(owner)),
            event_handle_vote: event::new_event_handle<VotedEvent>(signer::address_of(owner)),
            event_handle_resolve: event::new_event_handle<DisputeResolvedEvent>(signer::address_of(owner)),
            event_handle_malicious: event::new_event_handle<MaliciousTaskResolvedEvent>(signer::address_of(owner)),
        });
    }

    /// 用户质押成为仲裁员
    public entry fun stake(owner: &signer, amount: u64) {
        let state = borrow_global_mut<DisputeDAOState>(signer::address_of(owner));
        let sender = signer::address_of(owner);
        assert!(amount >= state.min_stake, 100);
        let mut found = false;
        let mut i = 0;
        let len = vector::length(&state.juror_index);
        while (i < len) {
            if (vector::borrow(&state.juror_index, i) == sender) {
                found = true;
                break;
            }
            i = i + 1;
        }
        assert!(!found, 101);
        vector::push_back(&mut state.jurors, Juror { addr: sender, stake_amount: amount, is_active: true, last_dispute_id: 0 });
        vector::push_back(&mut state.juror_index, sender);
        event::emit_event(&mut state.event_handle_stake, JurorStakedEvent { juror: sender, amount });
    }

    /// 退出仲裁员，返还质押金
    public entry fun unstake(owner: &signer) {
        let state = borrow_global_mut<DisputeDAOState>(signer::address_of(owner));
        let sender = signer::address_of(owner);
        let mut i = 0;
        let len = vector::length(&state.juror_index);
        let mut found = false;
        while (i < len) {
            if (vector::borrow(&state.juror_index, i) == sender) {
                found = true;
                break;
            }
            i = i + 1;
        }
        assert!(found, 102);
        let juror = vector::borrow_mut(&mut state.jurors, i);
        assert!(juror.is_active, 103);
        let amount = juror.stake_amount;
        juror.is_active = false;
        juror.stake_amount = 0;
        // 这里应集成实际返还逻辑
        event::emit_event(&mut state.event_handle_unstake, JurorUnstakedEvent { juror: sender, amount });
    }

    /// 发起争议，选取仲裁员
    public entry fun handle_dispute(owner: &signer, dispute_id: u64) {
        let state = borrow_global_mut<DisputeDAOState>(signer::address_of(owner));
        let juror_count = vector::length(&state.juror_index);
        assert!(juror_count >= state.jurors_per_dispute, 104);
        let mut selected = vector::empty<address>();
        let mut count = 0;
        let mut i = 0;
        while (count < state.jurors_per_dispute && i < juror_count) {
            let juror_addr = vector::borrow(&state.juror_index, i);
            let juror = vector::borrow(&state.jurors, i);
            if (juror.is_active) {
                vector::push_back(&mut selected, juror_addr);
                count = count + 1;
            }
            i = i + 1;
        }
        assert!(count == state.jurors_per_dispute, 105);
        // 扩展 dispute_jurors 到 dispute_id
        let len = vector::length(&state.dispute_jurors);
        let mut j = len;
        while (j <= dispute_id) {
            vector::push_back(&mut state.dispute_jurors, vector::empty<address>());
            vector::push_back(&mut state.has_voted, vector::empty<bool>());
            vector::push_back(&mut state.votes, vector::empty<address>());
            vector::push_back(&mut state.vote_count, 0);
            vector::push_back(&mut state.candidate_votes, vector::empty<u64>());
            j = j + 1;
        }
        *vector::borrow_mut(&mut state.dispute_jurors, dispute_id) = selected;
        // 更新仲裁员最近参与记录
        let mut k = 0;
        while (k < state.jurors_per_dispute) {
            let juror_addr = vector::borrow(&selected, k);
            let idx = find_juror_index(&state.juror_index, juror_addr);
            let juror = vector::borrow_mut(&mut state.jurors, idx);
            juror.last_dispute_id = dispute_id;
            k = k + 1;
        }
        event::emit_event(&mut state.event_handle_dispute, DisputeStartedEvent { dispute_id, jurors: selected });
    }

    /// 仲裁员投票
    public entry fun vote(owner: &signer, dispute_id: u64, winner: address) {
        let state = borrow_global_mut<DisputeDAOState>(signer::address_of(owner));
        let sender = signer::address_of(owner);
        let jurors = vector::borrow(&state.dispute_jurors, dispute_id);
        let mut is_juror = false;
        let mut i = 0;
        let len = vector::length(jurors);
        while (i < len) {
            if (vector::borrow(jurors, i) == sender) {
                is_juror = true;
                break;
            }
            i = i + 1;
        }
        assert!(is_juror, 106);
        let has_voted_vec = vector::borrow_mut(&mut state.has_voted, dispute_id);
        let votes_vec = vector::borrow_mut(&mut state.votes, dispute_id);
        let candidate_votes_vec = vector::borrow_mut(&mut state.candidate_votes, dispute_id);
        let mut voted = false;
        let mut j = 0;
        let len2 = vector::length(has_voted_vec);
        while (j < len2) {
            if (vector::borrow(jurors, j) == sender) {
                voted = *vector::borrow(has_voted_vec, j);
                break;
            }
            j = j + 1;
        }
        assert!(!voted, 107);
        // 记录投票
        vector::push_back(votes_vec, winner);
        vector::push_back(has_voted_vec, true);
        // 统计票数
        let mut found = false;
        let mut k = 0;
        let len3 = vector::length(candidate_votes_vec);
        while (k < len3) {
            if (vector::borrow(candidate_votes_vec, k) == 0) {
                *vector::borrow_mut(candidate_votes_vec, k) = 1;
                found = true;
                break;
            }
            k = k + 1;
        }
        if (!found) {
            vector::push_back(candidate_votes_vec, 1);
        }
        *vector::borrow_mut(&mut state.vote_count, dispute_id) = *vector::borrow(&state.vote_count, dispute_id) + 1;
        event::emit_event(&mut state.event_handle_vote, VotedEvent { dispute_id, juror: sender, winner });
        // 达到票数自动结算
        if (*vector::borrow(&state.vote_count, dispute_id) == state.jurors_per_dispute) {
            // 这里只是简单取最后一个 winner
            event::emit_event(&mut state.event_handle_resolve, DisputeResolvedEvent { dispute_id, winner });
        }
    }

    /// 恶意任务仲裁
    public entry fun arbitrate_malicious_task(owner: &signer, dispute_id: u64) {
        let state = borrow_global_mut<DisputeDAOState>(signer::address_of(owner));
        let jurors = vector::borrow(&state.dispute_jurors, dispute_id);
        event::emit_event(&mut state.event_handle_malicious, MaliciousTaskResolvedEvent { dispute_id, jurors: *jurors });
    }

    /// 查询某次仲裁的仲裁员列表
    public fun get_dispute_jurors(owner: address, dispute_id: u64): &vector::Vector<address> {
        let state = borrow_global<DisputeDAOState>(owner);
        vector::borrow(&state.dispute_jurors, dispute_id)
    }

    /// 查询仲裁员信息
    public fun get_juror_info(owner: address, juror_addr: address): option::Option<Juror> {
        let state = borrow_global<DisputeDAOState>(owner);
        let mut i = 0;
        let len = vector::length(&state.juror_index);
        while (i < len) {
            if (vector::borrow(&state.juror_index, i) == juror_addr) {
                return option::some(vector::borrow(&state.jurors, i));
            }
            i = i + 1;
        }
        option::none<Juror>()
    }

    /// 查询所有活跃仲裁员
    public fun get_active_jurors(owner: address): vector::Vector<address> {
        let state = borrow_global<DisputeDAOState>(owner);
        let mut actives = vector::empty<address>();
        let len = vector::length(&state.juror_index);
        let mut i = 0;
        while (i < len) {
            let juror = vector::borrow(&state.jurors, i);
            if (juror.is_active) {
                vector::push_back(&mut actives, vector::borrow(&state.juror_index, i));
            }
            i = i + 1;
        }
        actives
    }

    /// 辅助函数：查找仲裁员索引
    fun find_juror_index(indexes: &vector::Vector<address>, addr: address): u64 {
        let len = vector::length(indexes);
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(indexes, i) == addr) {
                return i;
            }
            i = i + 1;
        }
        0
    }
}
