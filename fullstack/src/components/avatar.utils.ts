function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

export function stringAvatar(name: string) {
    return {
        sx: {
            bgColor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')?.[1]?.[0] ?? ''}`,
    };
}
