module Escrow {
    use std::signer;
    use std::vector;
    use std::option;
    use std::address;
    use std::event;

    /// 事件定义
    struct FundsDepositedEvent has drop, store {
        task_id: u64,
        amount: u64,
    }
    struct FundsReleasedEvent has drop, store {
        task_id: u64,
        recipient: address,
    }
    struct FundsRefundedEvent has drop, store {
        task_id: u64,
        recipient: address,
        amount: u64,
    }
    struct PoolAddedEvent has drop, store {
        task_id: u64,
        amount: u64,
    }
    struct JurorRewardedEvent has drop, store {
        task_id: u64,
        juror: address,
        amount: u64,
    }

    /// 托管全局状态
    struct EscrowState has key {
        task_funds: vector::Vector<u64>,
        platform_pool: u64,
        event_handle_deposit: event::EventHandle<FundsDepositedEvent>,
        event_handle_release: event::EventHandle<FundsReleasedEvent>,
        event_handle_refund: event::EventHandle<FundsRefundedEvent>,
        event_handle_pool: event::EventHandle<PoolAddedEvent>,
        event_handle_juror: event::EventHandle<JurorRewardedEvent>,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, EscrowState {
            task_funds: vector::empty<u64>(),
            platform_pool: 0,
            event_handle_deposit: event::new_event_handle<FundsDepositedEvent>(signer::address_of(owner)),
            event_handle_release: event::new_event_handle<FundsReleasedEvent>(signer::address_of(owner)),
            event_handle_refund: event::new_event_handle<FundsRefundedEvent>(signer::address_of(owner)),
            event_handle_pool: event::new_event_handle<PoolAddedEvent>(signer::address_of(owner)),
            event_handle_juror: event::new_event_handle<JurorRewardedEvent>(signer::address_of(owner)),
        });
    }

    /// 存入资金到特定任务
    public entry fun deposit_funds(owner: &signer, task_id: u64, amount: u64) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        let len = vector::length(&state.task_funds);
        if (task_id >= len) {
            let mut i = len;
            while (i <= task_id) {
                vector::push_back(&mut state.task_funds, 0);
                i = i + 1;
            }
        }
        assert!(amount > 0, 100);
        state.task_funds[task_id] = state.task_funds[task_id] + amount;
        event::emit_event(&mut state.event_handle_deposit, FundsDepositedEvent { task_id, amount });
    }

    /// 释放资金给中标者
    public entry fun release_funds(owner: &signer, task_id: u64, winner: address) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        assert!(winner != @0x0, 101);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 102);
        let amount = state.task_funds[task_id];
        assert!(amount > 0, 103);
        state.task_funds[task_id] = 0;
        // 这里应集成实际转账逻辑
        event::emit_event(&mut state.event_handle_release, FundsReleasedEvent { task_id, recipient: winner });
    }

    /// 退还资金给任务创建者
    public entry fun refund_funds(owner: &signer, task_id: u64, creator: address) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 104);
        let amount = state.task_funds[task_id];
        assert!(amount > 0, 105);
        assert!(creator != @0x0, 106);
        state.task_funds[task_id] = 0;
        // 这里应集成实际转账逻辑
        event::emit_event(&mut state.event_handle_refund, FundsRefundedEvent { task_id, recipient: creator, amount });
    }

    /// 将恶意任务资金转入平台池
    public entry fun add_to_pool(owner: &signer, task_id: u64, amount: u64) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 107);
        assert!(state.task_funds[task_id] >= amount, 108);
        state.task_funds[task_id] = state.task_funds[task_id] - amount;
        state.platform_pool = state.platform_pool + amount;
        event::emit_event(&mut state.event_handle_pool, PoolAddedEvent { task_id, amount });
    }

    /// 争议处理中扣除保证金逻辑（预留接口）
    public entry fun slash_deposit(owner: &signer, task_id: u64, bidder: address) {
        // 可根据实际需求实现保证金惩罚逻辑
    }


    /// 批量奖励仲裁员（如恶意任务仲裁）
    public entry fun reward_jurors(owner: &signer, task_id: u64, jurors: &vector::Vector<address>, total_amount: u64) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 120);
        assert!(state.task_funds[task_id] >= total_amount, 121);
        let n = vector::length(jurors);
        assert!(n > 0, 122);
        let per_juror = total_amount / n;
        let mut i = 0;
        while (i < n) {
            let juror = vector::borrow(jurors, i);
            assert!(*juror != @0x0, 123);
            // 这里应集成实际转账逻辑
            event::emit_event(&mut state.event_handle_juror, JurorRewardedEvent { task_id, juror: *juror, amount: per_juror });
            i = i + 1;
        }
        state.task_funds[task_id] = state.task_funds[task_id] - total_amount;
    }

    /// 处理投票结果并奖励胜者
    public entry fun settle_vote_and_reward(owner: &signer, task_id: u64, winner: address, reward_amount: u64) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 130);
        assert!(state.task_funds[task_id] >= reward_amount, 131);
        assert!(winner != @0x0, 132);
        state.task_funds[task_id] = state.task_funds[task_id] - reward_amount;
        // 这里应集成实际转账逻辑
        event::emit_event(&mut state.event_handle_release, FundsReleasedEvent { task_id, recipient: winner });
    }

    /// 平台提取平台池资金
    public entry fun withdraw_platform_pool(owner: &signer, platform_addr: address) {
        let state = borrow_global_mut<EscrowState>(signer::address_of(owner));
        assert!(platform_addr != @0x0, 112);
        let amount = state.platform_pool;
        assert!(amount > 0, 113);
        state.platform_pool = 0;
        // 这里应集成实际转账逻辑
    }

    /// Getter
    public fun get_task_funds(owner: address, task_id: u64): u64 {
        let state = borrow_global<EscrowState>(owner);
        let len = vector::length(&state.task_funds);
        if (task_id < len) {
            state.task_funds[task_id]
        } else {
            0
        }
    }
    public fun get_platform_pool(owner: address): u64 {
        let state = borrow_global<EscrowState>(owner);
        state.platform_pool
    }
}
