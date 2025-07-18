address dandelion {
module Escrow {
    use std::signer;
    use std::vector;

    /// 托管全局状态
    struct EscrowState has key {
        task_funds: vector<u64>,
        platform_pool: u64,
    }

    /// 初始化
    public entry fun init(owner: &signer) {
        move_to(owner, EscrowState {
            task_funds: vector::empty<u64>(),
            platform_pool: 0,
        });
    }

    /// 存入资金到特定任务
    public entry fun deposit_funds(owner: &signer, task_id: u64, amount: u64) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        if (task_id >= len) {
            let i = len;
            while (i <= task_id) {
                vector::push_back(&mut state.task_funds, 0);
                i = i + 1;
            };
        };
        assert!(amount > 0, 100);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        *funds_ref = *funds_ref + amount;
    }

    /// 释放资金给中标者
    public entry fun release_funds(owner: &signer, task_id: u64, winner: address) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        assert!(winner != @0x0, 101);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 102);
        let amount = *vector::borrow(&state.task_funds, task_id);
        assert!(amount > 0, 103);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        *funds_ref = 0;
        // 这里应集成实际转账逻辑
    }

    /// 退还资金给任务创建者
    public entry fun refund_funds(owner: &signer, task_id: u64, creator: address) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 104);
        let amount = *vector::borrow(&state.task_funds, task_id);
        assert!(amount > 0, 105);
        assert!(creator != @0x0, 106);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        *funds_ref = 0;
        // 这里应集成实际转账逻辑
    }

    /// 将恶意任务资金转入平台池
    public entry fun add_to_pool(owner: &signer, task_id: u64, amount: u64) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 107);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        assert!(*funds_ref >= amount, 108);
        *funds_ref = *funds_ref - amount;
        state.platform_pool = state.platform_pool + amount;
    }

    /// 争议处理中扣除保证金逻辑（预留接口）
    public entry fun slash_deposit(owner: &signer, task_id: u64, bidder: address) {
        // 可根据实际需求实现保证金惩罚逻辑
    }

    /// 批量奖励仲裁员（如恶意任务仲裁）
    public entry fun reward_jurors(owner: &signer, task_id: u64, jurors: vector<address>, total_amount: u64) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 120);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        assert!(*funds_ref >= total_amount, 121);
        let n = vector::length(&jurors);
        assert!(n > 0, 122);
        let per_juror = total_amount / n;
        let i = 0;
        while (i < n) {
            let juror = *vector::borrow(&jurors, i);
            assert!(juror != @0x0, 123);
            // 这里应集成实际转账逻辑
            i = i + 1;
        };
        *funds_ref = *funds_ref - total_amount;
    }

    /// 处理投票结果并奖励胜者
    public entry fun settle_vote_and_reward(owner: &signer, task_id: u64, winner: address, reward_amount: u64) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        assert!(task_id < len, 130);
        let funds_ref = vector::borrow_mut(&mut state.task_funds, task_id);
        assert!(*funds_ref >= reward_amount, 131);
        assert!(winner != @0x0, 132);
        *funds_ref = *funds_ref - reward_amount;
        // 这里应集成实际转账逻辑
    }

    /// 平台提取平台池资金
    public entry fun withdraw_platform_pool(owner: &signer, platform_addr: address) acquires EscrowState {
        let state = borrow_global_mut<EscrowState>(@dandelion);
        assert!(platform_addr != @0x0, 112);
        let amount = state.platform_pool;
        assert!(amount > 0, 113);
        state.platform_pool = 0;
        // 这里应集成实际转账逻辑
    }

    /// Getter
    public fun get_task_funds(owner: address, task_id: u64): u64 acquires EscrowState {
        let state = borrow_global<EscrowState>(@dandelion);
        let len = vector::length(&state.task_funds);
        if (task_id < len) {
            *vector::borrow(&state.task_funds, task_id)
        } else {
            0
        }
    }
    public fun get_platform_pool(owner: address): u64 acquires EscrowState {
        let state = borrow_global<EscrowState>(@dandelion);
        state.platform_pool
    }
}
}
