module Utils exposing (durationFormat, releaseDateFormat, token)

import Time exposing (millisToPosix, toHour, toMinute, toSecond, utc)


token : String
token =
    "BQBZFAYg7V8E8YK2lJxot037TKUnFETEMlkY4JPd0E3S3QQX56MGfepaGEn8lzJP59BNvpUbs4Z5bpjtAzY"


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
