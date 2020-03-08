module MainHelper
class Result
	attr_reader :arrive_at, :label, :leave_at
	def initialize(arrival, label, leave = 30)
		@arrive_at = arrival
		@label = label
		@leave_at = @arrive_at + leave.minutes
	end
end
end
