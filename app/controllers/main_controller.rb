class MainController < ApplicationController
protect_from_forgery except: :getResults
include MainHelper
def getResults
params[:date_time] += "+00:00"
startTime = DateTime.iso8601(params[:date_time])
@results = []
#could display original start time in results in future
holdTime = startTime.dup
x = 1
while params.key?("latitude#{x}")
	if x == 1
		response = HTTParty.get("https://developer.citymapper.com/api/1/traveltime/?key=#{ENV["citymapper_key"]}&startcoord=51.5248785,-0.0835113&endcoord=#{params["latitude#{x}"]},#{params["longitude#{x}"]}&time=#{holdTime}&time_type=arrival", verify: false)

	else
		response = HTTParty.get("https://developer.citymapper.com/api/1/traveltime/?key=#{ENV["citymapper_key"]}&startcoord=#{params["latitude#{x - 1}"]},#{params["longitude#{x - 1}"]}&endcoord=#{params["latitude#{x}"]},#{params["longitude#{x}"]}&time=#{holdTime}&time_type=arrival", verify: false)
	end
	puts response
	holdTime += response["travel_time_minutes"].minutes
	if params.key?("timeAt#{x}")
		result = Result.new(holdTime, params["label#{x}"], params["timeAt#{x}"].to_i)
	else
		result = Result.new(holdTime, params["label#{x}"])
	end	
	holdTime = result.leave_at
	@results.push(result)
	x+=1
end
render json: @results.to_json
end
end