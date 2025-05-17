import Image from "next/image";
import Link from "next/link";

export default function SigninNavbar() {
    return(
        <div className="navbar bg-base-100 shadow-sm opacity-90">
            <div className="navbar-start px-40">
                <Image
                    src="https://t4.ftcdn.net/jpg/02/11/51/53/240_F_211515361_bnIbyKadClzn3hJT0zCPPuPApcG7k3lC.jpg"
                    width={128}
                    height={32}
                    className={`overflow-hidden transition-all  w-10 }`}
                    alt="Logo"
                />
                <h1 className="font-bold px-3 text-xl">Simulator</h1>
            </div>

            <div className="navbar-end px-40 py-1">
                <Link href="/login">
                    <button
                        type="button"
                        className="cursor-pointer text-white bg-green-700 hover:bg-green-800 focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        Sign in
                    </button>
                </Link>



            </div>
        </div>
    )
}