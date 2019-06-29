module Views.Artist exposing (artistList)

import Data.Artist
import Html as Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Route


artistList : List Data.Artist.ArtistSimplified -> Html msg
artistList artists =
    artists
        |> List.map (\ar -> a [ Route.href (Route.Artist ar.id) ] [ text ar.name ])
        |> List.intersperse (span [] [ text ", " ])
        |> span [ class "artist-name" ]
