module Views.Album exposing (view)

import Data.Image as Image exposing (..)
import Data.Meta
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import List.Extra as LE
import Utils
import Views.Artist


view : Data.Meta.AlbumModel -> Html msg
view model =
    let
        listTracksUri id =
            model.tracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    ]
                ]
                [ div [] []
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "bg-cover" ] [ imageView Large model.album.images ]
        , div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text model.album.name ]
            , div []
                [ span [] [ text "By " ]
                , span [] [ Views.Artist.artistList model.album.artists ]
                ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ div [ class "album" ]
                    [ div [ class "img" ]
                        [ imageView Large model.album.images
                        ]
                    , div [ class "playing-btn" ] [ i [ class "icon-play" ] [] ]
                    , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                    , div [] [ text <| Utils.releaseDateFormat model.album.release_date ]
                    , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                    ]
                ]
            , div []
                [ div [] (model.tracks |> List.map trackItem)
                ]
            ]
        ]
