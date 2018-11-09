module View.Releases exposing (view)

import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> Root.Model -> Html Msg
view player model =
    div []
        [ h1 [] [ text "The PRP" ]
        , model.releases.thePrp
            |> List.filter (\f -> not <| String.contains "Vinyl" f.album)
            |> List.filter (\f -> not <| String.contains "Deluxe" f.album)
            |> List.filter (\f -> not <| String.contains "Reissue" f.album)
            |> List.filter (\f -> not <| String.contains "Anniversary" f.album)
            |> List.filter (\f -> not <| String.contains "Remastered" f.album)
            |> List.map
                (\e ->
                    div []
                        [ text e.date
                        , text " - "
                        , a [ onClick <| Query (e.artist ++ " - " ++ e.album) ] [ text e.artist, text " - ", text e.album ]
                        ]
                )
            |> div []
        ]
