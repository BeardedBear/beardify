module Views.Artist exposing (artistList)

import Data.Artist
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route


artistList : List Data.Artist.ArtistSimplified -> Html msg
artistList artists =
    artists
        |> List.map (\ar -> a [ Route.href (Route.Artist ar.id) ] [ text ar.name ])
        |> List.intersperse (span [] [ text ", " ])
        |> span [ class "artist-name" ]
