import { IndianRupee, Clock } from 'lucide-react'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Checkbox } from './ui/checkbox'
import { useState } from 'react'

const Sidebar = ({ onSortChange, onDepartureTimeChange }) => {
  const [selectedSort, setSelectedSort] = useState('')
  const [selectedDepartureTimes, setSelectedDepartureTimes] = useState([])

  const sortBy = [
    { 
      icon: <IndianRupee size={16} />,
      title: "Price", 
      value: "price"
    },
    {
      icon: <Clock size={16} />,
      title: "Earliest Departure",
      value: "departure"
    }
  ]

  const departureTime = [
    {
      name: "departure_before_six_am",
      title: "Before 6:00",
      value: "before_6"
    },
    {
      name: "departure_six_to_noon",
      title: "6:00 - 12:00",
      value: "6_to_12"
    },
    {
      name: "departure_noon_to_six",
      title: "12:00 - 18:00",
      value: "12_to_18"
    },
  ]

  const handleSortChange = (value) => {
    setSelectedSort(value)
    onSortChange?.(value)
  }

  const handleDepartureTimeChange = (name, value, checked) => {
    let newSelectedTimes
    if (checked) {
      newSelectedTimes = [...selectedDepartureTimes, value]
    } else {
      newSelectedTimes = selectedDepartureTimes.filter(time => time !== value)
    }
    setSelectedDepartureTimes(newSelectedTimes)
    onDepartureTimeChange?.(newSelectedTimes)
  }

  const handleClearFilters = () => {
    setSelectedSort('')
    setSelectedDepartureTimes([])
    onSortChange?.('')
    onDepartureTimeChange?.([])
  }
  
  return (
    <aside className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="mb-2 px-4 text-lg font-semibold">Sort by</h2>
          <span 
            className="mb-2 px-4 text-sm text-primary text-right underline cursor-pointer"
            onClick={handleClearFilters}
          >
            Clear Filter
          </span>
        </div>
        <RadioGroup value={selectedSort} onValueChange={handleSortChange}>
          {sortBy.map(s => 
            <Label key={s.title} htmlFor={s.title} className="flex gap-2 items-center justify-between rounded-md bg-popover p-4 hover:bg-accent hover:text-accent-foreground">
              {s.icon}
              {s.title}
              <RadioGroupItem value={s.value} className="ml-auto" id={s.title} />
            </Label>
          )}
        </RadioGroup>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Departure time</h2>
        {departureTime.map(d => 
          <Label key={d.title} htmlFor={d.name} aria-label={d.name} className="flex gap-2 items-center justify-between rounded-md bg-popover p-4 hover:bg-accent hover:text-accent-foreground">
            {d.title}
            <Checkbox 
              name={d.name} 
              id={d.name}
              checked={selectedDepartureTimes.includes(d.value)}
              onCheckedChange={(checked) => handleDepartureTimeChange(d.name, d.value, checked)}
            />
          </Label>
        )}
      </div>
    </aside>
  )
}

export default Sidebar