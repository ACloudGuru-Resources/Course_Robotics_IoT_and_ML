class Queue {
    constructor() {
        this.queue = [];
        this.isBlocked = false;
    }

    add(item) {
        this.queue.unshift(item);
    }

    remove() {
        return this.queue.pop();
    }

    first() {
        return this.queue[0];
    }

    last() {
        return this.queue[this.queue.length -1];
    }

    size() {
        return this.queue.length;
    }

    waitForMessage() {
        if(this.size() > 0 && !this.isBlocked) return true;
        return false;
    }

    block() {
        this.block = true;
    }

    unblock() {
        this.block = false;
    }    
}

module.exports = Queue;