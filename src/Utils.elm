module Utils exposing (durationFormat, releaseDateFormat, token)

import Time exposing (millisToPosix, toHour, toMinute, toSecond, utc)


token : String
token =
    "BQAGnfZHQKjGXYQbkltEMOioaPo949UTt3waDSprI8F9qUZipb4kE6JzYcfjaxjm8Lpjo_6Bl5ewzv_2Fut2nB-MWJL2EDpWrBq7uOqQkxoeal5qgJqB6xVw4yv08Tirqjk9t6Cl0i3Iv2oXHfMgqhSutPzAsfG7"


durationFormat : Int -> String
durationFormat duration =
    let
        toTime unit =
            duration
                |> millisToPosix
                |> unit utc

        hour =
            if toTime toHour > 0 then
                String.fromInt (toTime toHour) ++ ":"

            else
                ""

        minute =
            String.fromInt (toTime toMinute) ++ ":"

        second =
            if toTime toSecond < 10 then
                "0" ++ String.fromInt (toTime toSecond)

            else
                String.fromInt (toTime toSecond)
    in
    hour ++ minute ++ second


releaseDateFormat : String -> String
releaseDateFormat date =
    date
        |> String.split "-"
        |> List.head
        |> Maybe.withDefault ""
