module View.Artist exposing (view)

import Artist exposing (..)
import Drawer exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Image exposing (..)
import Player exposing (..)
import Root exposing (..)
import Utils
import View.AlbumGallery as AlbumGallery exposing (..)


view : Player.Model -> ArtistModel -> Html Msg
view player data =
    let
        trackItem t =
            div [ class "track", onClick (ChangePlayingTrack [ t.uri ]) ]
                [ div [] [ imageView Small t.album.images ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        relatedArtistItem r =
            div [ class "related-artist", onClick (Get r.id) ]
                [ div [] [ imageView Small r.images ]
                , div [] [ text r.name ]
                ]
    in
    div [ class "artist-wrapper" ]
        [ div []
            [ div [ class "heading-page" ] [ text data.artist.name ]
            , div [] [ a [ href <| "https://fr.wikipedia.org/wiki/" ++ data.artist.name, target "_BLANK" ] [ text "Wikipedia" ], a [ href <| "https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=" ++ data.artist.name ++ "&x=0&y=0", target "_BLANK" ] [ text "Sputnik" ] ]
            , div [ class "artist-head" ]
                [ div [ class "top-tracks" ]
                    [ div [ class "sub-title" ] [ text "Top tracks" ]
                    , div [] (data.topTracks |> List.take 5 |> List.map trackItem)
                    ]
                , div []
                    [ div [ class "sub-title" ] [ text "Similar artists" ]
                    , div [ class "related-artists" ] (data.relatedArtists |> List.take 4 |> List.map relatedArtistItem)
                    ]
                ]
            , div [ class "sub-title" ] [ text "Albums" ]
            , AlbumGallery.view player data.albums
            ]
        , div [ class "video-wrapper" ]
            [ div [ class "sub-title" ] [ text "Videos" ]
            , div []
                (data.videos
                    |> List.map
                        (\v ->
                            div [ class "video-frame" ]
                                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 125, src <| "https://www.youtube.com/embed/" ++ v.id.videoId ] []
                                , div [ class "video-title" ] [ text v.snippet.title ]
                                , div [ class "video-channel" ] [ a [ target "_BLANK", href ("https://www.youtube.com/channel/" ++ v.snippet.channelId) ] [ text v.snippet.channelTitle ] ]
                                ]
                        )
                )
            ]
        ]
