module Views.Artist exposing (artistList)

import Data.Artist
import Html exposing (Html, a, span, text)
import Html.Attributes exposing (class)
import Route


artistList : List Data.Artist.ArtistSimplified -> Html msg
artistList artists =
    artists
        |> List.map (\ar -> a [ Route.href (Route.Artist ar.id) ] [ text ar.name ])
        |> List.intersperse (span [] [ text ", " ])
        |> span [ class "artist-name" ]
