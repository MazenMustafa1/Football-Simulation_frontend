import Image from 'next/image';

export default function DashboardImage() {
    return (
        <div className="w-[780px] h-[270px] relative rounded-xl overflow-hidden shadow-lg m-4">
            <Image
                src="https://img.freepik.com/premium-photo/head-pass-young-male-football-soccer-player-playing-with-ball-isolated-green-background-neon-light_1028938-431782.jpg"
                alt="Football Player"
                fill
                className="object-fill "
            />
        </div>

    );
}
