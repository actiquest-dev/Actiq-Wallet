type IArrowSize = {
    width: string,
    height: string;
    className?: string;
}

export const NavigationArrow = ({width, height, className}: IArrowSize) => (
    <svg className={className} width="22.000000" height="24.000000" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="clip6_6920">
                <rect id="Icon Library/u:angle-left" width="22.000000" height="24.000000" transform="matrix(-1 0 0 1 22 0)" fill="white" fillOpacity="0"/>
            </clipPath>
        </defs>
        <g clipPath="url(#clip6_6920)">
            <path id="Vector" d="M11.65 12L8.4 8.45C8.23 8.27 8.13 8.01 8.13 7.75C8.13 7.49 8.23 7.23 8.4 7.04C8.49 6.95 8.59 6.88 8.7 6.83C8.81 6.77 8.93 6.75 9.05 6.75C9.17 6.75 9.29 6.77 9.4 6.83C9.52 6.88 9.62 6.95 9.7 7.04L13.59 11.28C13.68 11.38 13.74 11.49 13.79 11.61C13.84 11.73 13.86 11.86 13.86 12C13.86 12.13 13.84 12.26 13.79 12.38C13.74 12.5 13.68 12.61 13.59 12.7L9.7 17C9.62 17.09 9.52 17.16 9.4 17.21C9.29 17.26 9.17 17.29 9.05 17.28C8.93 17.29 8.81 17.26 8.7 17.21C8.59 17.16 8.49 17.09 8.4 17C8.23 16.81 8.13 16.55 8.13 16.29C8.13 16.03 8.23 15.77 8.4 15.58L11.65 12Z" fill="#16C03C" fillOpacity="1.000000" fillRule="nonzero"/>
        </g>
    </svg>
);