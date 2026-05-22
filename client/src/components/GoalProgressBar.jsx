const GOAL = 10000

export function GoalProgressBar({ totalEUR }) {
  const percentage = Math.min((totalEUR / GOAL) * 100, 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-200">
        <span>€{totalEUR.toFixed(2)} saved</span>
        <span>Goal: €{GOAL.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5">
        <div
          className="bg-green-500 h-5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
        {percentage.toFixed(1)}% of goal reached
      </p>
    </div>
  )
}
