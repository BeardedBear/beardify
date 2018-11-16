module View.Releases exposing (view)

import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Time exposing (..)
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> Root.Model -> Html Msg
view player model =
    let
        currentArtists =
            player.item.artists |> List.map (\a -> a.name)

        day e =
            String.fromInt <| Time.toDay utc (millisToPosix e)

        month e =
            Debug.toString <| Time.toMonth utc (millisToPosix e)

        year e =
            String.fromInt <| Time.toYear utc (millisToPosix e)
    in
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
                    div [ classList [ ( "currently-playing", List.member e.artist currentArtists ) ] ]
                        [ if Time.toDay utc (millisToPosix e.date) <= model.config.currentDate.day then
                            a [ onClick <| Query (e.artist ++ " - " ++ e.album) ]
                                [ text <| day e.date ++ " " ++ month e.date ++ " " ++ year e.date ++ " - "
                                , text <| e.artist ++ " - " ++ e.album
                                ]

                          else
                            span [ style "opacity" "0.3" ]
                                [ text <| day e.date ++ " " ++ month e.date ++ " " ++ year e.date ++ " - "
                                , text <| e.artist ++ " - " ++ e.album
                                ]
                        ]
                )
            |> div []
        ]
