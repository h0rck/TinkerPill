import { useEffect, CSSProperties } from 'react';

// Add custom type for webkit app region
type WebkitAppRegion = CSSProperties & {
    WebkitAppRegion?: 'drag' | 'no-drag';
};

// Add type for the window.electron API
declare global {
    interface Window {
        electron: {
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
    }
}

const AppTitleBar = () => {
    useEffect(() => {
        const handleWindowControls = () => {
            const { electron } = window;
            if (!electron) return;

            const controls = {
                minimize: () => electron.minimize(),
                maximize: () => electron.maximize(),
                close: () => electron.close()
            };

            return controls;
        };

        const controls = handleWindowControls();
        if (!controls) return;

        // Attach event listeners
        document.querySelector('.minimize-btn')?.addEventListener('click', controls.minimize);
        document.querySelector('.maximize-btn')?.addEventListener('click', controls.maximize);
        document.querySelector('.close-btn')?.addEventListener('click', controls.close);

        return () => {
            // Cleanup listeners
            document.querySelector('.minimize-btn')?.removeEventListener('click', controls.minimize);
            document.querySelector('.maximize-btn')?.removeEventListener('click', controls.maximize);
            document.querySelector('.close-btn')?.removeEventListener('click', controls.close);
        };
    }, []);

    return (
        <div
            className="h-[30px] bg-[#1a1a1a] flex items-center justify-between px-2 fixed top-0 left-0 right-0 z-[1000]"
            style={{
                WebkitAppRegion: 'drag',
                userSelect: 'none'
            } as WebkitAppRegion}
        >
            <div className="text-white text-[13px] font-medium font-[system-ui,-apple-system,sans-serif]">
                TinkerPill
            </div>
            <div
                className="flex gap-[1px]"
                style={{ WebkitAppRegion: 'no-drag' } as WebkitAppRegion}
            >
                <button
                    className="border-0 bg-transparent text-white text-base px-3 h-[30px] cursor-pointer transition-colors hover:bg-white/10 minimize-btn"
                >
                    ─
                </button>
                <button
                    className="border-0 bg-transparent text-white text-base px-3 h-[30px] cursor-pointer transition-colors hover:bg-white/10 maximize-btn"
                >
                    □
                </button>
                <button
                    className="border-0 bg-transparent text-white text-base px-3 h-[30px] cursor-pointer transition-colors hover:bg-[#e81123] close-btn"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default AppTitleBar;