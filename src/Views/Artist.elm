module Views.Artist exposing (view)

import Data.Artist exposing (ArtistSimplified)
import Html exposing (Html, a, span, text)
import Html.Attributes exposing (class)
import Route


view : List ArtistSimplified -> Html msg
view artistList =
    artistList
        |> List.map (\artist -> a [ Route.href (Route.Artist artist.id) ] [ text artist.name ])
        |> List.intersperse (span [] [ text ", " ])
        |> span [ class "Artist" ]
