module BiddingSystem {
    use std::signer;
    use std::vector;
    use std::option;
    use std::address;
    use std::event;

    /// 竞标信息结构体
    struct Bid has copy, drop, store {
        bidder: address,
        amount: u64,
        is_qualified: bool,
    }

    /// 事件
    struct NewBidEvent has drop, store {
        task_id: u64,
        bidder: address,
    }
    struct WinnerSelectedEvent has drop, store {
        task_id: u64,
        winner: address,
    }

    /// 全局状态
    struct BiddingSystemState has key {
        task_bids: vector::Vector<vector::Vector<Bid>>,
        winners: vector::Vector<option::Option<address>>,
        deposit_amount: u64,
        event_handle_new_bid: event::EventHandle<NewBidEvent>,
        event_handle_winner: event::EventHandle<WinnerSelectedEvent>,
    }

    /// 初始化
    public entry fun init(owner: &signer, deposit_amount: u64) {
        move_to(owner, BiddingSystemState {
            task_bids: vector::empty<vector::Vector<Bid>>(),
            winners: vector::empty<option::Option<address>>(),
            deposit_amount,
            event_handle_new_bid: event::new_event_handle<NewBidEvent>(signer::address_of(owner)),
            event_handle_winner: event::new_event_handle<WinnerSelectedEvent>(signer::address_of(owner)),
        });
    }

    /// 开启某任务的竞标，重置之前的投标
    public entry fun open_bidding(owner: &signer, task_id: u64) {
        let state = borrow_global_mut<BiddingSystemState>(signer::address_of(owner));
        let len = vector::length(&state.task_bids);
        if (task_id < len) {
            *vector::borrow_mut(&mut state.task_bids, task_id) = vector::empty<Bid>();
        } else {
            // 填充到 task_id
            let mut i = len;
            while (i <= task_id) {
                vector::push_back(&mut state.task_bids, vector::empty<Bid>());
                vector::push_back(&mut state.winners, option::none<address>());
                i = i + 1;
            }
        }
    }

    /// 用户参与投标，需缴纳保证金，且不能重复投标
    public entry fun place_bid(owner: &signer, task_id: u64, deposit: u64) {
        let state = borrow_global_mut<BiddingSystemState>(signer::address_of(owner));
        assert!(deposit == state.deposit_amount, 100);
        let len = vector::length(&state.task_bids);
        assert!(task_id < len, 101);
        let bids = vector::borrow_mut(&mut state.task_bids, task_id);
        let sender = signer::address_of(owner);
        let mut i = 0;
        let bids_len = vector::length(bids);
        while (i < bids_len) {
            let b = vector::borrow(bids, i);
            assert!(b.bidder != sender, 102); // 防止重复投标
            i = i + 1;
        }
        vector::push_back(bids, Bid { bidder: sender, amount: deposit, is_qualified: false });
        event::emit_event(&mut state.event_handle_new_bid, NewBidEvent { task_id, bidder: sender });
    }

    /// 工厂合约可将某投标人标记为合格
    public entry fun qualify_bidder(owner: &signer, task_id: u64, bid_index: u64) {
        let state = borrow_global_mut<BiddingSystemState>(signer::address_of(owner));
        let bids = vector::borrow_mut(&mut state.task_bids, task_id);
        let len = vector::length(bids);
        assert!(bid_index < len, 103);
        let bid = vector::borrow_mut(bids, bid_index);
        bid.is_qualified = true;
    }

    /// 工厂合约选出中标者
    public entry fun select_winner(owner: &signer, task_id: u64, bid_index: u64) {
        let state = borrow_global_mut<BiddingSystemState>(signer::address_of(owner));
        let bids = vector::borrow(&state.task_bids, task_id);
        let len = vector::length(bids);
        assert!(bid_index < len, 104);
        let winner = vector::borrow(bids, bid_index).bidder;
        *vector::borrow_mut(&mut state.winners, task_id) = option::some(winner);
        event::emit_event(&mut state.event_handle_winner, WinnerSelectedEvent { task_id, winner });
    }

    /// 获取某任务所有投标
    public fun get_bids(owner: address, task_id: u64): &vector::Vector<Bid> {
        let state = borrow_global<BiddingSystemState>(owner);
        vector::borrow(&state.task_bids, task_id)
    }

    /// 获取中标者
    public fun get_winner(owner: address, task_id: u64): option::Option<address> {
        let state = borrow_global<BiddingSystemState>(owner);
        vector::borrow(&state.winners, task_id)
    }
}
