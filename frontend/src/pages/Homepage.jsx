import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ExperimentsPreview from '../components/ExperimentsPreview'
import HowItWorks from '../components/HowItWorks'
import Community from '../components/Community'
import Footer from '../components/Footer'

function Homepage() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1">
				<Hero />
				<ExperimentsPreview />
				<HowItWorks />
				<Community />
			</main>
			<Footer />
		</div>
	)
}

export default Homepage


