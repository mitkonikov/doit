export const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
};

export const dayDiff = (calendarStartDate: Date) => {
    let nowDate = new Date();

    const one_day = 1000 * 60 * 60 * 24;

    if (nowDate.getMonth() == 11 && calendarStartDate.getDate() > 25)
        nowDate.setFullYear(nowDate.getFullYear() + 1);

    let dayDiff =
        Math.floor(
            Math.round(nowDate.getTime() - calendarStartDate.getTime()) /
                one_day
        ) + 1;

    return dayDiff;
};
