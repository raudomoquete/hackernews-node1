function postedBy(root, args, context) {
    return context.prisma.link({ id: root.id }).postedBy()
}

module.exports = {
    postedBy,
}