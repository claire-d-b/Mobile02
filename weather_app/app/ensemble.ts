import { fetchWeatherApi } from "openmeteo";

import { Variable } from '@openmeteo/sdk/variable';
import { Aggregation } from '@openmeteo/sdk/aggregation';
		
interface EnsembleParams {
	latitude: number;
	longitude: number;
	daily: string[];
	hourly: string[];
	models: string;
};

export const getWeatherEnsembleData = async ({ ...params }: EnsembleParams) => {
    const url = "https://ensemble-api.open-meteo.com/v1/ensemble";
    const responses = await fetchWeatherApi(url, params);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const latitude = response.latitude();
    const longitude = response.longitude();
    const elevation = response.elevation();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    console.log(
        `\nCoordinates: ${latitude}°N ${longitude}°E`,
        `\nElevation: ${elevation}m asl`,
        `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
    );

    const hourly = response.hourly()!;
    const hourlyVariables = Array.from(
        { length: hourly.variablesLength() }, 
        (_, i) => hourly.variables(i),
    );
    const hourlyTemperature2m = hourlyVariables.filter(
        (v) => v?.variable() === Variable.temperature && v?.altitude() === 2,
    );
    const hourlyWeatherCode = hourlyVariables.filter(
        (v) => v?.variable() === Variable.weather_code,
    );
    const hourlyPrecipitation = hourlyVariables.filter(
        (v) => v?.variable() === Variable.precipitation,
    );
    const hourlyRain = hourlyVariables.filter(
        (v) => v?.variable() === Variable.rain,
    );
    const hourlySnowfall = hourlyVariables.filter(
        (v) => v?.variable() === Variable.snowfall,
    );
    const hourlyCloudCover = hourlyVariables.filter(
        (v) => v?.variable() === Variable.cloud_cover,
    );
    const hourlyWindSpeed10m = hourlyVariables.filter(
        (v) => v?.variable() === Variable.wind_speed && v?.altitude() === 10,
    );

    const daily = response.daily()!;
    const dailyVariables = Array.from(
        { length: daily.variablesLength() }, 
        (_, i) => daily.variables(i),
    );
    const dailyTemperature2mMin = dailyVariables.filter(
        (v) => v?.variable() === Variable.temperature && v?.altitude() === 2 && v?.aggregation() === Aggregation.minimum,
    );
    const dailyTemperature2mMean = dailyVariables.filter(
        (v) => v?.variable() === Variable.temperature && v?.altitude() === 2 && v?.aggregation() === Aggregation.mean,
    );
    const dailyTemperature2mMax = dailyVariables.filter(
        (v) => v?.variable() === Variable.temperature && v?.altitude() === 2 && v?.aggregation() === Aggregation.maximum,
    );
    const dailyPrecipitationSum = dailyVariables.filter(
        (v) => v?.variable() === Variable.precipitation && v?.aggregation() === Aggregation.sum // ✅
    );
    const dailyPrecipitationHours = dailyVariables.filter(
        (v) => v?.variable() === Variable.precipitation_hours,
    );
    const dailySnowfallSum = dailyVariables.filter(
        (v) => v?.variable() === Variable.snowfall && v?.aggregation() === Aggregation.sum // ✅
    );
    const dailyRainSum = dailyVariables.filter(
        (v) => v?.variable() === Variable.rain && v?.aggregation() === Aggregation.sum // ✅
    );
    const dailyWindSpeed10mMean = dailyVariables.filter(
        (v) => v?.variable() === Variable.wind_speed && v?.altitude() === 10 && v?.aggregation() === Aggregation.mean,
    );
    const dailyWindSpeed10mMin = dailyVariables.filter(
        (v) => v?.variable() === Variable.wind_speed && v?.altitude() === 10 && v?.aggregation() === Aggregation.minimum,
    );
    const dailyWindSpeed10mMax = dailyVariables.filter(
        (v) => v?.variable() === Variable.wind_speed && v?.altitude() === 10 && v?.aggregation() === Aggregation.maximum,
    );

    const weatherData: {
    hourly: { time: Date[]; [key: string]: Date[] | Float32Array | null };
    daily: { time: Date[]; [key: string]: Date[] | Float32Array | null };
    } = {
    hourly: {
        time: Array.from(
        { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
    },
    daily: {
        time: Array.from(
        { length: (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval() },
        (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
    },
    };

    // Process all members
    for (const variable of hourlyTemperature2m) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`temperature_2m_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlyWeatherCode) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`weather_code_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlyPrecipitation) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`precipitation_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlyRain) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`rain_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlySnowfall) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`snowfall_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlyCloudCover) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`cloud_cover_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of hourlyWindSpeed10m) {
        const member = variable?.ensembleMember();
        weatherData.hourly[`wind_speed_10m_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyTemperature2mMin) {
        const member = variable?.ensembleMember();
        weatherData.daily[`temperature_2m_min_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyTemperature2mMean) {
        const member = variable?.ensembleMember();
        weatherData.daily[`temperature_2m_mean_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyTemperature2mMax) {
        const member = variable?.ensembleMember();
        weatherData.daily[`temperature_2m_max_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyPrecipitationSum) {
        const member = variable?.ensembleMember();
        weatherData.daily[`precipitation_sum_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyPrecipitationHours) {
        const member = variable?.ensembleMember();
        weatherData.daily[`precipitation_hours_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailySnowfallSum) {
        const member = variable?.ensembleMember();
        weatherData.daily[`snowfall_sum_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyRainSum) {
        const member = variable?.ensembleMember();
        weatherData.daily[`rain_sum_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyWindSpeed10mMean) {
        const member = variable?.ensembleMember();
        weatherData.daily[`wind_speed_10m_mean_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyWindSpeed10mMin) {
        const member = variable?.ensembleMember();
        weatherData.daily[`wind_speed_10m_min_member${member}`] = variable!.valuesArray()!;
    }
    for (const variable of dailyWindSpeed10mMax) {
        const member = variable?.ensembleMember();
        weatherData.daily[`wind_speed_10m_max_member${member}`] = variable!.valuesArray()!;
    }

    // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
    console.log("\nHourly data:\n", weatherData.hourly)
    console.log("\nDaily data:\n", weatherData.daily)
}
