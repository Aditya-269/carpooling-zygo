import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Header from './components/Header'
import OfferSeat from './pages/OfferSeat'
import Footer from './components/Footer'
import SearchPage from './pages/SearchPage'
import Error from './pages/Error'
import RideDetail from './pages/RideDetail'
import Profile from './pages/Profile'
import RideConfirmed from './pages/RideConfirmed'
import MeetDriver from './pages/MeetDriver'
import RideTracking from './pages/RideTracking'
import RideComplete from './pages/RideComplete'
import Payment from './pages/Payment'

function App() {

  return (
    <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/*" element={<Error />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/offer-seat" element={<OfferSeat />} />
      <Route path="/ride/:rideId" element={<RideDetail />} />
      <Route path="/ride/:rideId/confirmed" element={<RideConfirmed />} />
      <Route path="/ride/:rideId/meet-driver" element={<MeetDriver />} />
      <Route path="/ride/:rideId/tracking" element={<RideTracking />} />
      <Route path="/ride/:rideId/payment" element={<Payment />} />
      <Route path="/ride/:rideId/complete" element={<RideComplete />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    <Footer />
    </>
  )
}

export default App
