module View.Releases exposing (view)

import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Time exposing (..)
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> Root.Model -> Html Msg
view player model =
    let
        currentArtists =
            player.item.artists |> List.map (\a -> a.name)

        day e =
            Time.toDay utc (millisToPosix e)

        month e =
            Time.toMonth utc (millisToPosix e)

        year e =
            Time.toYear utc (millisToPosix e)

        release e =
            text <|
                (String.fromInt <| day e.date)
                    ++ " "
                    ++ (Debug.toString <| month e.date)
                    ++ " "
                    ++ (String.fromInt <| year e.date)
                    ++ " - "
                    ++ e.artist
                    ++ " - "
                    ++ e.album

        releaseQuery e =
            Query (e.artist ++ " - " ++ e.album)
    in
    div []
        [ h1 [] [ text "The PRP" ]
        , if model.releases.thePrp == [] then
            span [ class "loader" ] [ i [ class "icon-loader" ] [] ]

          else
            model.releases.thePrp
                |> List.filter (\f -> not <| String.contains "Vinyl" f.album)
                |> List.filter (\f -> not <| String.contains "Deluxe" f.album)
                |> List.filter (\f -> not <| String.contains "Reissue" f.album)
                |> List.filter (\f -> not <| String.contains "Anniversary" f.album)
                |> List.filter (\f -> not <| String.contains "Remastered" f.album)
                |> List.filter (\f -> not <| String.contains "Platinum" f.album)
                |> List.filter (\f -> not <| String.contains "7" f.album)
                |> List.filter (\f -> not <| String.contains "12" f.album)
                |> List.map
                    (\e ->
                        div [ classList [ ( "currently-playing", List.member e.artist currentArtists ) ] ]
                            [ if day e.date < model.config.currentDate.day then
                                a [ class "previous-release", onClick (releaseQuery e) ] [ release e ]

                              else if day e.date == model.config.currentDate.day then
                                a [ onClick (releaseQuery e) ] [ b [] [ release e ] ]

                              else
                                span [ class "next-release" ] [ release e ]
                            ]
                    )
                |> div []
        ]
