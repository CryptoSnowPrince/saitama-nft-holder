export const getRNG = (seconds) => {
    if (seconds > 0) {
        // Calculating the days, hours, minutes and seconds left
        const timeDays = Math.floor(seconds / (60 * 60 * 24))
        const timeHours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60))
        const timeMinutes = Math.floor((seconds % (60 * 60)) / 60)

        if (timeDays > 0) {
            return `${timeDays}Days and ${timeHours}Hours`
        } else {
            return `${timeHours}Hours and ${timeMinutes}Minutes`
        }
    }

    return `0Minutes`
}
