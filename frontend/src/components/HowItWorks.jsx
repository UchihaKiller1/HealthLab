const steps = [
	{
		title: 'Collect Data',
		desc: 'Use wearables and quick forms to log health metrics.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M12 3.75A8.25 8.25 0 1 0 20.25 12 8.26 8.26 0 0 0 12 3.75zm0 12a3.75 3.75 0 1 1 3.75-3.75A3.754 3.754 0 0 1 12 15.75z" />
			</svg>
		),
	},
	{
		title: 'Analyze in Cloud',
		desc: 'Run insights and trends securely in the cloud.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M6.75 14.25a4.5 4.5 0 1 1 8.73-1.5h.27a3.75 3.75 0 0 1 0 7.5H7.5a3 3 0 1 1-.75-6z" />
			</svg>
		),
	},
	{
		title: 'Share & Inspire',
		desc: 'Publish results and learn from the community.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M7.5 6.75A2.25 2.25 0 1 0 9.75 9 2.25 2.25 0 0 0 7.5 6.75zM3 18.75a4.5 4.5 0 0 1 9 0v.75H3v-.75zM16.5 6.75A2.25 2.25 0 1 0 18.75 9 2.25 2.25 0 0 0 16.5 6.75zM12.75 18.75v.75h8.25v-.75a4.5 4.5 0 0 0-8.25 0z" />
			</svg>
		),
	},
]

function HowItWorks() {
	return (
		<section id="about" className="py-16 bg-secondary/30">
			<div className="container-responsive">
				<h2 className="font-champ text-3xl sm:text-4xl text-accent mb-8">How it works</h2>
				<div className="grid sm:grid-cols-3 gap-6">
					{steps.map((s) => (
						<div key={s.title} className="rounded-2xl bg-white ring-1 ring-secondary/60 p-6 shadow-card hover:shadow-lg transition-shadow">
							<div className="h-12 w-12 rounded-lg bg-secondary text-accent flex items-center justify-center">
								{s.icon}
							</div>
							<h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
							<p className="mt-2 text-slate-700 text-sm leading-relaxed">{s.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default HowItWorks


