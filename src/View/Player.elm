module View.Player exposing (view)

import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Utils
import View.Artist exposing (..)


view : Player.Model -> Html Msg
view player =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ if player.is_playing then
                    button [ onClick PlayerPause, class "play" ] [ i [ class "icon-pause" ] [] ]

                  else
                    button [ onClick PlayerPlay, class "play" ] [ i [ class "icon-play" ] [] ]
                , button [ onClick PlayerPrevious ] [ i [ class "icon-to-start" ] [] ]
                , button [ onClick PlayerNext ] [ i [ class "icon-to-end" ] [] ]
                , button
                    [ classList [ ( "active", player.shuffle_state ) ]
                    , if player.shuffle_state then
                        onClick PlayerShuffleOff

                      else
                        onClick PlayerShuffleOn
                    ]
                    [ i [ class "icon-shuffle" ] [] ]
                , button [] [ i [ classList [ ( "icon-loop", True ), ( "active", player.repeat_state == "on" ) ] ] [] ]
                ]
            ]
        , div [ class "current" ]
            [ div [ onClick (GetAlbum player.item.album.id) ] [ imageView Small player.item.album.images ]
            , div []
                [ div []
                    [ span [ class "track" ] [ text player.item.name ]
                    , span [] [ text " - " ]
                    , artistList player.item.artists
                    ]
                , div [ class "range" ]
                    [ span [ class "time" ] [ text <| Utils.durationFormat player.progress_ms ]
                    , input
                        [ type_ "range"
                        , Html.Attributes.value <| String.fromInt player.progress_ms
                        , Html.Attributes.min "0"
                        , Html.Attributes.max <| String.fromInt player.item.duration_ms
                        , onInput PlayerSeek
                        ]
                        []
                    , span [ class "time" ] [ text <| Utils.durationFormat player.item.duration_ms ]
                    , div [ class "progress" ]
                        [ div
                            [ style "width" <| String.fromFloat (toFloat player.progress_ms / toFloat player.item.duration_ms * 100) ++ "%"
                            , class "progress-current"
                            ]
                            []
                        ]
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
