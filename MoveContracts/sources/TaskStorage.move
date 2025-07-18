address dandelion {
module TaskStorage {
    use std::signer;
    use std::vector;
    use std::string;
    use std::option;

    /// 任务状态
    const CREATED: u8 = 0;
    const BIDDING: u8 = 1;
    const IN_PROGRESS: u8 = 2;
    const PENDING_EMPLOYER_CONFIRM: u8 = 3;
    const COMPLETED: u8 = 4;
    const DISPUTED: u8 = 5;
    const PENDING_DISPUTE_PERIOD: u8 = 6;
    const DELETED: u8 = 7;

    /// 参与者存款结构体
    struct Deposit has copy, drop, store {
        addr: address,
        amount: u64,
    }

    /// 任务结构体
    struct Task has key, store {
        id: u64,
        title: string::String,
        ipfs_hash: string::String,
        complete_url: string::String,
        first_demo_url: string::String,
        creator: address,
        reward: u64,
        status: u8,
        winner: option::Option<address>,
        deadline: u64,
        participants: vector<address>,
        dispute_deadline: u64,
        locked: bool,
        task_type: string::String,
        creator_deposit: u64,
        participant_deposits: vector<Deposit>
    }

    /// 只读视图结构体
    struct TaskView has copy, drop, store {
        id: u64,
        title: string::String,
        ipfs_hash: string::String,
        complete_url: string::String,
        first_demo_url: string::String,
        creator: address,
        reward: u64,
        status: u8,
        winner: option::Option<address>,
        deadline: u64,
        dispute_deadline: u64,
        locked: bool,
        task_type: string::String,
        creator_deposit: u64,
    }

    /// 任务存储全局状态
    struct TaskStorageState has key {
        tasks: vector<Task>,
        task_count: u64,
        task_types: vector<string::String>,
        task_verification_pending: vector<bool>,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, TaskStorageState {
            tasks: vector::empty<Task>(),
            task_count: 0,
            task_types: vector::empty<string::String>(),
            task_verification_pending: vector::empty<bool>(),
        });
    }

    /// 创建任务
    public entry fun create_task(
        owner: &signer,
        title: string::String,
        ipfs_hash: string::String,
        reward: u64,
        deadline: u64,
        task_type: string::String,
        creator_deposit: u64
    ) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let id = state.task_count;
        let task = Task {
            id,
            title,
            ipfs_hash,
            complete_url: string::utf8(b""),
            first_demo_url: string::utf8(b""),
            creator: signer::address_of(owner),
            reward,
            status: CREATED,
            winner: option::none<address>(),
            deadline,
            participants: vector::empty<address>(),
            dispute_deadline: 0,
            locked: false,
            task_type,
            creator_deposit,
            participant_deposits: vector::empty<Deposit>(),
        };
        vector::push_back(&mut state.tasks, task);
        state.task_count = id + 1;
        vector::push_back(&mut state.task_verification_pending, false);
        // 无返回值
    }

    /// 添加参与者
    public entry fun add_participant(owner: &signer, task_id: u64, participant: address, first_demo_url: string::String, deposit: u64) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        vector::push_back(&mut task.participants, participant);
        task.first_demo_url = first_demo_url;
        vector::push_back(&mut task.participant_deposits, Deposit { addr: participant, amount: deposit });
    }

    /// 设置任务类型
    public entry fun set_task_type(owner: &signer, type_name: string::String) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        vector::push_back(&mut state.task_types, type_name);
    }

    /// 获取任务类型
    public fun get_task_type(owner: address, type_id: u64): string::String acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        *vector::borrow(&state.task_types, type_id)
    }

    /// Getter 示例
    public fun get_task_creator(owner: address, task_id: u64): address acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).creator
    }
    public fun get_task_status(owner: address, task_id: u64): u8 acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).status
    }
    public fun get_task_winner(owner: address, task_id: u64): option::Option<address> acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).winner
    }
    public fun get_task_deadline(owner: address, task_id: u64): u64 acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).deadline
    }
    public fun get_task_dispute_deadline(owner: address, task_id: u64): u64 acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).dispute_deadline
    }
    public fun is_task_locked(owner: address, task_id: u64): bool acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).locked
    }
    public fun get_task_reward(owner: address, task_id: u64): u64 acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).reward
    }
    public fun get_task_complete_url(owner: address, task_id: u64): string::String acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).complete_url
    }
    public fun get_task_first_demo_url(owner: address, task_id: u64): string::String acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).first_demo_url
    }

    /// Setter 示例
    public entry fun update_task_status(owner: &signer, task_id: u64, status: u8) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.status = status;
    }
    public entry fun update_task_winner(owner: &signer, task_id: u64, winner: option::Option<address>) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.winner = winner;
    }
    public entry fun update_task_complete_url(owner: &signer, task_id: u64, url: string::String) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.complete_url = url;
    }
    public entry fun set_task_dispute_deadline(owner: &signer, task_id: u64, deadline: u64) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.dispute_deadline = deadline;
    }
    public entry fun lock_task(owner: &signer, task_id: u64) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.locked = true;
    }
    public entry fun unlock_task(owner: &signer, task_id: u64) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.locked = false;
    }

    /// 参与者相关
    public fun task_exists(owner: address, task_id: u64): bool acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        task_id < state.task_count
    }

    /// 任务验证状态
    public entry fun set_task_verification_pending(owner: &signer, task_id: u64, pending: bool) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        let verification_ref = vector::borrow_mut(&mut state.task_verification_pending, task_id);
        *verification_ref = pending;
    }

    /// 删除任务
    public entry fun remove_task(owner: &signer, task_id: u64) acquires TaskStorageState {
        let state = borrow_global_mut<TaskStorageState>(@dandelion);
        // 通过修改状态来标记任务为已删除
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        task.status = DELETED;
        task.title = string::utf8(b"");
        task.ipfs_hash = string::utf8(b"");
        task.complete_url = string::utf8(b"");
        task.first_demo_url = string::utf8(b"");
        task.creator = @0x0;
        task.reward = 0;
        task.winner = option::none<address>();
        task.deadline = 0;
        task.dispute_deadline = 0;
        task.locked = false;
        task.task_type = string::utf8(b"");
        task.creator_deposit = 0;
        // 清空参与者列表
        task.participants = vector::empty<address>();
        task.participant_deposits = vector::empty<Deposit>();
    }

    /// 获取任务视图
    public fun get_task_view(owner: address, task_id: u64): TaskView acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        let t = vector::borrow(&state.tasks, task_id);
        TaskView {
            id: t.id,
            title: t.title,
            ipfs_hash: t.ipfs_hash,
            complete_url: t.complete_url,
            first_demo_url: t.first_demo_url,
            creator: t.creator,
            reward: t.reward,
            status: t.status,
            winner: t.winner,
            deadline: t.deadline,
            dispute_deadline: t.dispute_deadline,
            locked: t.locked,
            task_type: t.task_type,
            creator_deposit: t.creator_deposit,
        }
    }

    public fun get_task_participants(owner: address, task_id: u64): vector<address> acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        vector::borrow(&state.tasks, task_id).participants
    }

    public fun get_participant_deposit(owner: address, task_id: u64, participant: address): u64 acquires TaskStorageState {
        let state = borrow_global<TaskStorageState>(@dandelion);
        let task = vector::borrow(&state.tasks, task_id);
        let deposits = &task.participant_deposits;
        let len = vector::length(deposits);
        let i = 0;
        while (i < len) {
            let deposit = vector::borrow(deposits, i);
            if (deposit.addr == participant) {
                return deposit.amount;
            };
            i = i + 1;
        };
        0
    }
}
}
