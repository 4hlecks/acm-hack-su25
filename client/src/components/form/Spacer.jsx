export default function Spacer({ size = '1rem', axis = 'y' }) {
    const style = axis === 'x'
        ? { width: size, height: 1 }
        : { height: size, width: '100%' };
    return <div style={style} />;
}