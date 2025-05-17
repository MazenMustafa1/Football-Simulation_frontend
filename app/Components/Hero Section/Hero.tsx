import SigninNavbar from "@/app/Components/Navbar/SigninNavbar";

export default function Hero() {
    return (
        <div
            className="hero min-h-screen"
            style={{
                backgroundImage: "url('/images/Stadium dark.png')",
            }}
        >
            {/* Navbar at the top */}
            <div className="w-full  absolute top-0 left-0">
               <SigninNavbar></SigninNavbar>
            </div>

            <div className="hero-overlay"></div>

            <div className="hero-content text-neutral-content text-center">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Simulate Football Matches</h1>
                    <p className="mb-5">
                        Dive into realistic football simulations powered by AI. Generate full match events, stats, and outcomes —
                        just like watching the real game unfold.
                    </p>
                    <button className="btn btn-primary">Get Started</button>
                </div>
            </div>
        </div>

    );
}
