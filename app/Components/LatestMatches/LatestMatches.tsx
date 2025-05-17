import MatchCard from "./MatchCard";

export default function LatestMatches() {
    return (
        <section className="mt-8 px-4">
            <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
            <div className="flex flex-col gap-4">
                <MatchCard teamA="Team A" teamB="Team B" scoreA={2} scoreB={1} />
                <MatchCard teamA="Team C" teamB="Team D" scoreA={0} scoreB={0} />
                <MatchCard teamA="Team E" teamB="Team F" scoreA={3} scoreB={2} />
            </div>
        </section>
    );
}
