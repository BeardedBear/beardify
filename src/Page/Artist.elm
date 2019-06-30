module Page.Artist exposing (Msg(..), init, update, view)

import Data.Album exposing (Album, AlbumId, decodeAlbum)
import Data.Artist exposing (Artist, artistInit, decodeArtist)
import Data.Image
import Data.Meta exposing (ArtistModel)
import Data.Modal exposing (modalInit)
import Data.Playlist exposing (PlaylistId)
import Data.Session exposing (Session)
import Data.Track exposing (Track, TrackSimplified, decodeTrack, decodeTrackSimplified)
import Data.Youtube exposing (Youtube, getVideos)
import Html exposing (Html, a, div, i, iframe, text)
import Html.Attributes exposing (attribute, class, classList, height, href, src, target, width)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (map)
import List.Extra as LE
import Request
import Route
import Utils
import Views.Modal


init : String -> Session -> ( ArtistModel, Cmd Msg )
init id session =
    ( { artist = artistInit
      , albums = []
      , videos = []
      , topTracks = []
      , relatedArtists = []
      , modal = modalInit
      }
    , Cmd.batch
        [ Http.send SetArtist <| Request.get "artists/" id "" decodeArtist session.token
        , Http.send SetArtistAlbums <| Request.get "artists/" id "/albums?market=FR&album_type=album" (Decode.at [ "items" ] (Decode.list decodeAlbum)) session.token
        , Http.send SetArtistTopTracks <| Request.get "artists/" id "/top-tracks?country=FR" (Decode.at [ "tracks" ] (Decode.list decodeTrack)) session.token
        , Http.send SetRelatedArtists <| Request.get "artists/" id "/related-artists" (Decode.at [ "artists" ] (Decode.list decodeArtist)) session.token
        ]
    )


type Msg
    = SetArtist (Result Http.Error Artist)
    | SetArtistAlbums (Result Http.Error (List Album))
    | SetArtistTopTracks (Result Http.Error (List Track))
    | SetRelatedArtists (Result Http.Error (List Artist))
    | SetYoutube (Result Http.Error Youtube)
    | PlayTracks (List String)
    | PlayAlbum String
    | ModalOpen (Result Http.Error (List TrackSimplified))
    | ModalGetTrack AlbumId
    | ModalAddTrack PlaylistId
    | SetModalTrack (Result Http.Error ())
    | ModalClear


update : Session -> Msg -> ArtistModel -> ( ArtistModel, Cmd Msg )
update session msg ({ modal } as model) =
    case msg of
        SetArtist (Ok artist) ->
            ( { model | artist = artist }
            , Cmd.batch
                [ Http.send SetYoutube <| getVideos artist.name
                ]
            )

        SetArtist (Err _) ->
            ( model, Cmd.none )

        SetArtistAlbums (Ok album) ->
            ( { model | albums = album }
            , Cmd.none
            )

        SetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        SetArtistTopTracks (Ok trackList) ->
            ( { model | topTracks = trackList }, Cmd.none )

        SetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        SetRelatedArtists (Ok artistList) ->
            ( { model | relatedArtists = artistList }, Cmd.none )

        SetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        SetYoutube (Ok videoList) ->
            ( { model | videos = videoList }, Cmd.none )

        SetYoutube (Err _) ->
            ( model, Cmd.none )

        PlayTracks _ ->
            ( model, Cmd.none )

        PlayAlbum _ ->
            ( model, Cmd.none )

        ModalOpen (Ok trackList) ->
            let
                firstTrack =
                    trackList
                        |> List.map (\f -> f.uri)
                        |> List.take 1
            in
            ( { model | modal = { modal | isOpen = True, inPocket = firstTrack } }
            , Cmd.none
            )

        ModalOpen (Err _) ->
            ( model, Cmd.none )

        ModalGetTrack albumId ->
            ( model
            , Cmd.batch
                [ Http.send ModalOpen <|
                    Request.get "albums/" albumId "/tracks" (Decode.at [ "items" ] (Decode.list decodeTrackSimplified)) session.token
                ]
            )

        ModalAddTrack playlistId ->
            let
                trackList =
                    String.concat model.modal.inPocket
            in
            ( model
            , Http.send SetModalTrack <|
                Request.post "playlists/" playlistId ("/tracks?position=0&uris=" ++ trackList) session.token
            )

        SetModalTrack (Ok _) ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )

        SetModalTrack (Err _) ->
            ( model, Cmd.none )

        ModalClear ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )


view : Session -> ArtistModel -> ( String, List (Html Msg) )
view session ({ modal } as model) =
    let
        listTracksUri trackUri =
            model.topTracks
                |> LE.dropWhile (\track -> track.uri /= trackUri)
                |> List.map .uri

        trackItem track =
            div
                [ classList
                    [ ( "track", True )
                    , ( "active", track.uri == session.player.item.uri )
                    ]
                ]
                [ div [] [ Data.Image.imageView Data.Image.Small track.album.images ]
                , div [ onClick <| PlayTracks (listTracksUri track.uri) ] [ text track.name ]
                , div [] [ text (Utils.durationFormat track.duration_ms) ]
                ]

        relatedArtistItem relatedArtist =
            a [ class "related-artist", Route.href (Route.Artist relatedArtist.id) ]
                [ div [] [ Data.Image.imageView Data.Image.Small relatedArtist.images ]
                , div [] [ text relatedArtist.name ]
                ]

        videoFrame video =
            div [ class "video-frame" ]
                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 140, src <| "https://www.youtube.com/embed/" ++ video.id ] []
                , div [ class "video-title" ] [ text video.snippet.title ]
                , div [ class "artist-name" ] [ a [ target "_BLANK", href ("https://www.youtube.com/channel/" ++ video.snippet.channelId) ] [ text video.snippet.channelTitle ] ]
                ]

        albumItem album =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", session.player.item.album.id == album.id )
                    ]
                ]
                [ a
                    [ class "img"
                    , Route.href (Route.Album album.id)
                    ]
                    [ Data.Image.imageView Data.Image.Medium album.images
                    ]
                , div [] [ text album.name ]
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat album.release_date ++ ")" ]
                , div [ class "playing-btn", onClick <| PlayAlbum album.uri ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn", onClick <| ModalGetTrack album.id ] [ i [ class "icon-add" ] [] ]
                ]

        link name urlBefore urlAfter icon =
            a [ href <| urlBefore ++ model.artist.name ++ urlAfter, target "_BLANK" ] [ i [ class <| "icon-" ++ icon ] [], text name ]
    in
    ( model.artist.name
    , [ Views.Modal.view
            { isOpen = modal.isOpen
            , session = session
            , close = ModalClear
            , add = ModalAddTrack
            }
      , div
            [ class "artist-wrapper drawer-content" ]
            [ div []
                [ div [ class "heading-page" ] [ text model.artist.name ]
                , div [ class "links" ]
                    [ link "Wikipedia" "https://fr.wikipedia.org/wiki/" "" "wikipedia"
                    , link "Sputnik" "https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=" "&x=0&y=0" "sputnik"
                    , link "Discogs" "https://www.discogs.com/fr/search/?q=" "&type=artist&strict=true" "discogs"
                    , link "Google" "https://www.google.com/search?q=" "" "magnifying-glass"
                    ]
                , div [ class "artist-head" ]
                    [ div [ class "top-tracks" ]
                        [ div [ class "sub-title" ] [ text "Top tracks" ]
                        , div [] (model.topTracks |> List.take 5 |> List.map trackItem)
                        ]
                    , div []
                        [ div [ class "sub-title" ] [ text "Similar artists" ]
                        , div [ class "related-artists" ] (model.relatedArtists |> List.take 4 |> List.map relatedArtistItem)
                        ]
                    ]
                , div [ class "sub-title" ] [ text "Albums" ]
                , model.albums
                    |> List.map albumItem
                    |> div [ class "album-list-wrapper" ]
                ]
            , div [ class "video-wrapper" ]
                [ div [ class "sub-title" ] [ text "Videos" ]
                , div [] (model.videos |> List.map videoFrame)
                ]
            ]
      ]
    )
