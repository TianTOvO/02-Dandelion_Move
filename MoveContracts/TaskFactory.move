module TaskFactory {

    use std::signer;
    use std::vector;
    use std::string;
    use std::option;
    use std::event;

    /// 任务状态
    const CREATED: u8 = 0;
    const BIDDING: u8 = 1;
    const IN_PROGRESS: u8 = 2;
    const PENDING_EMPLOYER_CONFIRM: u8 = 3;
    const COMPLETED: u8 = 4;
    const DISPUTED: u8 = 5;
    const PENDING_DISPUTE_PERIOD: u8 = 6;

    /// 任务结构体
    struct Task has key, store {
        id: u64,
        title: string::String,
        ipfs_hash: string::String,
        creator: address,
        reward: u64,
        status: u8,
        winner: option::Option<address>,
        participants: vector::Vector<address>,
        deadline: u64,
        dispute_deadline: u64,
        locked: bool,
        task_type: string::String,
    }

    /// 任务工厂全局状态
    struct TaskFactoryState has key {
        tasks: vector::Vector<Task>,
        task_count: u64,
        event_handle: event::EventHandle<TaskEvent>,
    }

    /// 任务相关事件
    struct TaskEvent has drop, store {
        task_id: u64,
        status: u8,
        winner: option::Option<address>,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, TaskFactoryState {
            tasks: vector::empty<Task>(),
            task_count: 0,
            event_handle: event::new_event_handle<TaskEvent>(signer::address_of(owner)),
        });
    }

    /// 创建任务
    public entry fun create_task(
        owner: &signer,
        title: string::String,
        ipfs_hash: string::String,
        reward: u64,
        deadline: u64,
        task_type: string::String
    ) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let id = state.task_count;
        let task = Task {
            id,
            title,
            ipfs_hash,
            creator: signer::address_of(owner),
            reward,
            status: CREATED,
            winner: option::none<address>(),
            participants: vector::empty<address>(),
            deadline,
            dispute_deadline: 0,
            locked: false,
            task_type,
        };
        vector::push_back(&mut state.tasks, task);
        state.task_count = id + 1;
        event::emit_event(&mut state.event_handle, TaskEvent { task_id: id, status: CREATED, winner: option::none<address>() });
    }

    /// 参与任务
    public entry fun participate(owner: &signer, task_id: u64) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == BIDDING, 100);
        vector::push_back(&mut task.participants, signer::address_of(owner));
    }

    /// 选中标者
    public entry fun select_winner(owner: &signer, task_id: u64, winner: address) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == BIDDING, 101);
        task.winner = option::some(winner);
        task.status = IN_PROGRESS;
        event::emit_event(&mut state.event_handle, TaskEvent { task_id, status: IN_PROGRESS, winner: option::some(winner) });
    }

    /// 雇主确认任务完成
    public entry fun employer_confirm(owner: &signer, task_id: u64, is_confirm: bool, now: u64) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == PENDING_EMPLOYER_CONFIRM, 102);
        task.dispute_deadline = now + 86400; // 1天争议期
        task.locked = false;
        if (is_confirm) {
            task.status = COMPLETED;
            event::emit_event(&mut state.event_handle, TaskEvent { task_id, status: COMPLETED, winner: task.winner });
        } else {
            task.status = PENDING_DISPUTE_PERIOD;
            event::emit_event(&mut state.event_handle, TaskEvent { task_id, status: PENDING_DISPUTE_PERIOD, winner: option::none<address>() });
        }
    }


    /// 发起争议
    public entry fun dispute(owner: &signer, task_id: u64, now: u64) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == PENDING_DISPUTE_PERIOD, 103);
        assert!(now <= task.dispute_deadline, 104); // 必须在争议期内
        task.status = DISPUTED;
        event::emit_event(&mut state.event_handle, TaskEvent { task_id, status: DISPUTED, winner: option::none<address>() });
    }

    /// 争议结算
    public entry fun settle(owner: &signer, task_id: u64, winner: option::Option<address>) {
        let state = borrow_global_mut<TaskFactoryState>(signer::address_of(owner));
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == DISPUTED, 105);
        task.status = COMPLETED;
        task.winner = winner;
        event::emit_event(&mut state.event_handle, TaskEvent { task_id, status: COMPLETED, winner });
    }

    /// 获取单个任务
    public fun get_task(owner: address, task_id: u64): &Task {
        let state = borrow_global<TaskFactoryState>(owner);
        vector::borrow(&state.tasks, task_id)
    }

    /// 获取所有任务
    public fun get_all_tasks(owner: address): &vector::Vector<Task> {
        let state = borrow_global<TaskFactoryState>(owner);
        &state.tasks
    }

}