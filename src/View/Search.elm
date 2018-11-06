module View.Search exposing (view)

import Data.Image as Image exposing (..)
import Data.Search as Search exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import Utils


view : Search.Model -> Html Msg
view searchMsg =
    let
        artistItem a =
            div [ class "artist-item", onClick (GetArtist a.id) ]
                [ div [ class "img" ] [ imageView Small a.images ]
                , span [] [ text a.name ]
                ]

        albumItem al =
            div [ class "album-item" ]
                [ div [ class "search-cover-image", onClick (GetAlbum al.id) ] [ imageView Small al.images ]
                , div []
                    [ strong [ onClick (GetAlbum al.id) ] [ text <| al.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")"
                    , al.artists
                        |> List.map (\ar -> a [ onClick (GetArtist ar.id) ] [ text ar.name ])
                        |> List.intersperse (span [] [ text ", " ])
                        |> div [ class "artist-name" ]
                    ]
                ]

        trackItem t =
            div [ class "track-item" ]
                [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ i [ class "icon-play" ] [] ]
                , div []
                    [ strong [] [ text t.name ]
                    , t.artists
                        |> List.map (\ar -> a [ onClick (GetArtist ar.id) ] [ text ar.name ])
                        |> List.intersperse (span [] [ text ", " ])
                        |> div [ class "artist-name" ]
                    ]
                , div []
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div [] [ input [ placeholder "Recherche", type_ "text", onInput Query, Html.Attributes.value searchMsg.searchQuery ] [] ]
        , if searchMsg.searchQuery /= "" then
            div [ class "results" ]
                [ div []
                    [ div [ class "title" ] [ text "Artists" ]
                    , div [] (searchMsg.findArtist |> List.map artistItem)
                    ]
                , div []
                    [ div [ class "title" ] [ text "Albums" ]
                    , div []
                        (searchMsg.findAlbum
                            |> List.filter (\a -> a.album_type == "album")
                            |> List.map albumItem
                        )
                    ]
                , div []
                    [ div [ class "title" ] [ text "Tracks" ]
                    , div []
                        (searchMsg.findTrack |> List.map trackItem)
                    ]
                ]

          else
            text ""
        ]
