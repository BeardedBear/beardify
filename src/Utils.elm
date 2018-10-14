module Utils exposing (durationFormat, releaseDateFormat)

import Time exposing (millisToPosix, toHour, toMinute, toSecond, utc)


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
