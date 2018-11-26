module Data.Date exposing (Date, monthToString)

import Time exposing (..)


type alias Date =
    { year : Int
    , month : Month
    , day : Int
    , hour : Int
    , minute : Int
    , second : Int
    , milliSecond : Int
    }


monthToString : Month -> String
monthToString month =
    case month of
        Jan ->
            "janvier"

        Feb ->
            "février"

        Mar ->
            "mars"

        Apr ->
            "avril"

        May ->
            "mai"

        Jun ->
            "juin"

        Jul ->
            "juillet"

        Aug ->
            "aout"

        Sep ->
            "septembre"

        Oct ->
            "octobre"

        Nov ->
            "novembre"

        Dec ->
            "decembre"
