module Utils exposing
    ( durationFormat
    , durationFormatMinutes
    , getId
    , releaseDateFormat
    )

import Time exposing (millisToPosix, toHour, toMinute, toSecond, utc)
import Url exposing (Url)


getId : Url -> String
getId url =
    case url.fragment of
        Just e ->
            e |> String.split "/" |> List.take 3 |> List.drop 2 |> String.concat

        _ ->
            String.fromFloat e


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


durationFormatMinutes : Int -> String
durationFormatMinutes duration =
    let
        toTime unit =
            duration
                |> millisToPosix
                |> unit utc

        hour =
            if toTime toHour > 0 then
                String.fromInt (toTime toHour) ++ " hr "

            else
                ""

        minute =
            String.fromInt (toTime toMinute) ++ " min"
    in
    hour ++ minute


releaseDateFormat : String -> String
releaseDateFormat date =
    date
        |> String.split "-"
        |> List.head
        |> Maybe.withDefault ""
