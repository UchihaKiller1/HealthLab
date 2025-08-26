const testimonials = [
	{
		name: 'Alex P.',
		quote: 'Sleep experiment helped me improve my routine by 30 minutes.',
		role: 'Runner',
	},
	{
		name: 'Jamie L.',
		quote: 'Diet tracking revealed patterns I never noticed before.',
		role: 'Nutrition Enthusiast',
	},
	{
		name: 'Sam K.',
		quote: 'Weekly fitness challenges keep me motivated and consistent.',
		role: 'Engineer',
	},
]

function Community() {
	return (
		<section id="community" className="py-16 bg-white">
			<div className="container-responsive">
				<div className="flex items-end justify-between gap-4 mb-8">
					<h2 className="font-champ text-3xl sm:text-4xl text-accent">Community Inspiration</h2>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((t) => (
						<figure key={t.name} className="rounded-2xl ring-1 ring-secondary/60 bg-gradient-to-br from-white to-secondary/40 p-6 shadow-card hover:shadow-lg transition-shadow">
							<blockquote className="text-slate-800">“{t.quote}”</blockquote>
							<figcaption className="mt-4 text-sm text-slate-600">
								<span className="font-semibold text-accent">{t.name}</span> • {t.role}
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	)
}

export default Community


