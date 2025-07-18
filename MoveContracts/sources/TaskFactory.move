address dandelion {
module TaskFactory {
    use std::signer;
    use std::vector;
    use std::string;

    /// 任务状态枚举
    const TASK_OPEN: u8 = 0;
    const TASK_IN_PROGRESS: u8 = 1;
    const TASK_COMPLETED: u8 = 2;
    const TASK_DISPUTED: u8 = 3;
    const TASK_CANCELLED: u8 = 4;

    /// 任务结构体
    struct Task has copy, drop, store {
        creator: address,
        title: string::String,
        description: string::String,
        budget: u64,
        deadline: u64,
        participants: vector<address>,
        status: u8,
        winner: address,
        dispute_deadline: u64,
        locked: bool,
    }

    /// 全局状态
    struct TaskFactoryState has key {
        tasks: vector<Task>,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, TaskFactoryState {
            tasks: vector::empty<Task>(),
        });
    }

    /// 创建新任务
    public entry fun create_task(
        owner: &signer,
        title: vector<u8>,
        description: vector<u8>,
        budget: u64,
        deadline: u64,
    ) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task_id = vector::length(&state.tasks);
        let task = Task {
            creator: signer::address_of(owner),
            title: string::utf8(title),
            description: string::utf8(description),
            budget,
            deadline,
            participants: vector::empty<address>(),
            status: TASK_OPEN,
            winner: @0x0,
            dispute_deadline: 0,
            locked: false,
        };
        vector::push_back(&mut state.tasks, task);
    }

    /// 参与任务竞标
    public entry fun participate_task(owner: &signer, task_id: u64) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_OPEN, 100);
        vector::push_back(&mut task.participants, signer::address_of(owner));
    }

    /// 选择中标者
    public entry fun select_winner(owner: &signer, task_id: u64, winner: address) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_OPEN, 101);
        assert!(task.creator == signer::address_of(owner), 102); // 只有创建者可以选择中标者
        task.winner = winner;
        task.status = TASK_IN_PROGRESS;
    }

    /// 开始争议
    public entry fun start_dispute(owner: &signer, task_id: u64, dispute_deadline: u64) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_IN_PROGRESS, 103);
        assert!(task.creator == signer::address_of(owner) || task.winner == signer::address_of(owner), 104); // 只有创建者或中标者可以发起争议
        task.dispute_deadline = dispute_deadline;
        task.locked = true;
        task.status = TASK_DISPUTED;
    }

    /// 解决争议
    public entry fun resolve_dispute(owner: &signer, task_id: u64, final_winner: address) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_DISPUTED, 105);
        // 这里可以添加DAO权限检查
        task.winner = final_winner;
        task.locked = false;
        task.status = TASK_COMPLETED;
    }

    /// 完成任务
    public entry fun complete_task(owner: &signer, task_id: u64) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_IN_PROGRESS, 106);
        assert!(task.winner == signer::address_of(owner), 107); // 只有中标者可以完成任务
        task.status = TASK_COMPLETED;
    }

    /// 取消任务
    public entry fun cancel_task(owner: &signer, task_id: u64) acquires TaskFactoryState {
        let state = borrow_global_mut<TaskFactoryState>(@dandelion);
        let task = vector::borrow_mut(&mut state.tasks, task_id);
        assert!(task.status == TASK_OPEN, 108);
        assert!(task.creator == signer::address_of(owner), 109); // 只有创建者可以取消任务
        task.status = TASK_CANCELLED;
    }

    /// Getter 函数
    public fun get_all_tasks(): vector<Task> acquires TaskFactoryState {
        let state = borrow_global<TaskFactoryState>(@dandelion);
        *&state.tasks
    }

    public fun get_task(task_id: u64): Task acquires TaskFactoryState {
        let state = borrow_global<TaskFactoryState>(@dandelion);
        *vector::borrow(&state.tasks, task_id)
    }

    /// View 函数 - 用于前端调用
    #[view]
    public fun view_get_all_tasks(): vector<Task> acquires TaskFactoryState {
        let state = borrow_global<TaskFactoryState>(@dandelion);
        *&state.tasks
    }

    #[view]
    public fun view_get_task(task_id: u64): Task acquires TaskFactoryState {
        let state = borrow_global<TaskFactoryState>(@dandelion);
        *vector::borrow(&state.tasks, task_id)
    }
}
}