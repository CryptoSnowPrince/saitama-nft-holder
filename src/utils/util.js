export const getRNG = () => {
    const rand = parseInt(Math.random() * 10000000 + 100000000)

    return rand.toString().substring(0, 8);
}
