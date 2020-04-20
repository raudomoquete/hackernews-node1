const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')


async function signup(root, args, context, info) {

    const hashedPassword = await bcrypt.hash(args.password, 10)

    const {password, ...user} = await context.prisma.createUser({ ...args, password: hashedPassword })

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

async function login(root, args, context, info) {

    const {password, ...user} = await context.prisma.user({ email: args.email })
    if (!user) {
        throw new Error('No such user found')
    }

    const valid = await bcrypt.compare(args.password, password)
    if (!valid) {
        throw new Error('Invaid Password')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

function post(root, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.createLink({
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } }
    })
}

async function vote(root, args, context, info) {

    const userId = getUserId(context)

    const voteExists = await context.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.linkId },
    })
    if (voteExists) {
        throw new Error(`Already voted for link: ${args.linkId}`)
    }

    return context.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: linkId } },
    })
}

module.exports = {
    signup,
    login,
    post,
    vote,
    
}