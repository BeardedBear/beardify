module View.Player exposing (view)

import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Utils


view : Player.Model -> Html Msg
view player =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ if player.is_playing then
                    button [ onClick ClickPause, class "play" ] [ i [ class "icon-pause" ] [] ]

                  else
                    button [ onClick ClickPlay, class "play" ] [ i [ class "icon-play" ] [] ]
                , button [ onClick ClickPrevious ] [ i [ class "icon-to-start" ] [] ]
                , button [ onClick ClickNext ] [ i [ class "icon-to-end" ] [] ]
                , button
                    [ classList [ ( "active", player.shuffle_state ) ]
                    , if player.shuffle_state then
                        onClick ClickShuffleOff

                      else
                        onClick ClickShuffleOn
                    ]
                    [ i [ class "icon-shuffle" ] [] ]
                , button [] [ i [ classList [ ( "icon-loop", True ), ( "active", player.repeat_state == "on" ) ] ] [] ]
                ]
            ]
        , div [ class "current" ]
            [ div [ onClick (GetA player.item.album.id) ] [ imageView Small player.item.album.images ]
            , div []
                [ div []
                    [ span [ class "track" ] [ text player.item.name ]
                    , span [] [ text " - " ]
                    , span [ class "artist-name" ]
                        (player.item.artists
                            |> List.map (\ar -> a [ onClick (Get ar.id) ] [ text <| ar.name ++ " " ])
                        )
                    ]
                , div [ class "range" ]
                    [ span [ class "time" ] [ text <| Utils.durationFormat player.progress_ms ]
                    , input
                        [ type_ "range"
                        , Html.Attributes.value <| String.fromInt player.progress_ms
                        , Html.Attributes.min "0"
                        , Html.Attributes.max <| String.fromInt player.item.duration_ms
                        , onInput ChangeSeek
                        ]
                        []
                    , span [ class "time" ] [ text <| Utils.durationFormat player.item.duration_ms ]
                    ]
                ]
            ]
        , div [ class "options" ]
            [ div [] [ button [] [ i [ class "icon-sound" ] [] ] ]
            , div []
                [ input
                    [ type_ "range"
                    , Html.Attributes.value <| String.fromInt player.device.volume_percent
                    , Html.Attributes.min "0"
                    , Html.Attributes.max "100"
                    ]
                    []
                ]
            ]
        ]
