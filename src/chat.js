const { normalize: norm, denormalize: denorm, schema } = require("normalizr");

class ChatNormalizr {
    static #user = new schema.Entity('users')
    static #message = new schema.Entity('messages', {
        value: { author: ChatNormalizr.#user }
    })
    static #chatSchema = new schema.Entity('chat', {
        messages: [ ChatNormalizr.#message ]
    })
    static normalizeChat(content) {
        const chat = { id: 1, messages: content }
        return norm(chat, ChatNormalizr.#chatSchema)
    }
    static denormalizeChat(normalizedChat) {
        return denorm(normalizedChat.result, ChatNormalizr.#chatSchema, normalizedChat.entities)
    }

    #content
    #normalized
    #denormalized

    constructor(content) {
        this.#content = content
    }

    normalize() {
        if (!this.#normalized) {
            const chat = { id: 1, messages: this.#content }
            this.#normalized = norm(chat, ChatNormalizr.#chatSchema)
        }
        return this.#normalized
    }

    denormalize() {
        if (!this.#denormalized) {
            const normalizedChat = this.normalize()
            this.#denormalized = denorm(this.normalize().result, ChatNormalizr.#chatSchema, normalizedChat.entities)
        }
        return this.#denormalized
    }

    messages() {
        return this.#content
    } 
}

module.exports = ChatNormalizr