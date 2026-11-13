import Foundation
import AVFoundation
import AppKit
import CoreVideo

struct Segment: Decodable {
    let image: String
    let narration: String
    let duration: Double
}
let workspace = FileManager.default.currentDirectoryPath
let work = "\(workspace)/video-pitch/ibm-devfest"
let finalURL = URL(fileURLWithPath: "\(workspace)/pitch/Carpool_IBM_DevFest_Video_Pitch.mp4")
let silentURL = URL(fileURLWithPath: "\(work)/visuals.mov")
let segments = try! JSONDecoder().decode([Segment].self, from: Data(contentsOf: URL(fileURLWithPath: "\(work)/segments.json")))

func run(_ executable: String, _ arguments: [String]) throws {
    let process = Process()
    process.executableURL = URL(fileURLWithPath: executable)
    process.arguments = arguments
    try process.run()
    process.waitUntilExit()
    if process.terminationStatus != 0 {
        throw NSError(domain: "PitchVideo", code: Int(process.terminationStatus), userInfo: [NSLocalizedDescriptionKey: "Command failed: \(executable)"])
    }
}

func audioDuration(_ url: URL) -> Double {
    let asset = AVURLAsset(url: url)
    return CMTimeGetSeconds(asset.duration)
}

func makePixelBuffer(pool: CVPixelBufferPool, current: CGImage, next: CGImage?, progress: Double, frameProgress: Double, width: Int, height: Int) -> CVPixelBuffer? {
    var pixelBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
    guard let buffer = pixelBuffer else { return nil }
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    guard let base = CVPixelBufferGetBaseAddress(buffer) else { return nil }
    let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
    guard let context = CGContext(data: base, width: width, height: height, bitsPerComponent: 8, bytesPerRow: bytesPerRow, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue) else { return nil }
    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    func draw(_ image: CGImage, alpha: CGFloat, zoom: CGFloat) {
        let iw = CGFloat(image.width), ih = CGFloat(image.height)
        let canvasW = CGFloat(width), canvasH = CGFloat(height)
        let scale = max(canvasW / iw, canvasH / ih) * zoom
        let drawW = iw * scale, drawH = ih * scale
        let rect = CGRect(x: (canvasW - drawW) / 2, y: (canvasH - drawH) / 2, width: drawW, height: drawH)
        context.saveGState()
        context.setAlpha(alpha)
        context.draw(image, in: rect)
        context.restoreGState()
    }

    let zoom = CGFloat(1.0)
    draw(current, alpha: 1.0, zoom: zoom)
    if let next, progress > 0 {
        draw(next, alpha: CGFloat(progress), zoom: 1.0)
    }
    return buffer
}

@main
struct PitchRenderer {
    static func main() async throws {
        try FileManager.default.createDirectory(atPath: work, withIntermediateDirectories: true)
        if FileManager.default.fileExists(atPath: finalURL.path) { try FileManager.default.removeItem(at: finalURL) }
        if FileManager.default.fileExists(atPath: silentURL.path) { try FileManager.default.removeItem(at: silentURL) }

        var audioURLs: [URL] = []
        var durations: [Double] = []
        for (index, segment) in segments.enumerated() {
            let url = URL(fileURLWithPath: String(format: "%@/narration-%02d.aiff", work, index + 1))
            if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
            var speechRate = 165
            for _ in 0..<4 {
                if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
                try run("/usr/bin/say", ["-v", "Samantha", "-r", String(speechRate), "-o", url.path, segment.narration])
                let measured = audioDuration(url)
                if measured <= segment.duration - 0.4 { break }
                speechRate = Int(ceil(Double(speechRate) * measured / (segment.duration - 0.7))) + 2
            }
            guard audioDuration(url) < segment.duration else {
                throw NSError(domain: "PitchVideo", code: 20, userInfo: [NSLocalizedDescriptionKey: "Narration exceeds segment duration"])
            }
            print("Narration \(index + 1): \(audioDuration(url)) seconds / \(segment.duration)")
            audioURLs.append(url)
            durations.append(segment.duration)
        }

        let width = 1920, height = 1080, fps: Int32 = 5
        let writer = try AVAssetWriter(outputURL: silentURL, fileType: .mov)
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 5_000_000,
                AVVideoMaxKeyFrameIntervalKey: Int(fps * 5),
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
            ]
        ]
        let input = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            kCVPixelBufferWidthKey as String: width,
            kCVPixelBufferHeightKey as String: height
        ])
        writer.add(input)
        writer.startWriting()
        writer.startSession(atSourceTime: .zero)
        guard let pool = adaptor.pixelBufferPool else { throw NSError(domain: "PitchVideo", code: 2) }

        let cgImages: [CGImage] = try segments.map { segment in
            guard let image = NSImage(contentsOfFile: segment.image), let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
                throw NSError(domain: "PitchVideo", code: 3, userInfo: [NSLocalizedDescriptionKey: "Cannot load \(segment.image)"])
            }
            return cg
        }

        var frameNumber: Int64 = 0
        for index in segments.indices {
            let seconds = durations[index]
            let frames = Int(ceil(seconds * Double(fps)))
            for localFrame in 0..<frames {
                while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.004) }
                let localSeconds = Double(localFrame) / Double(fps)
                let transition = index < segments.count - 1 ? max(0, min(1, (localSeconds - seconds + 0.55) / 0.55)) : 0
                let progress = localSeconds / max(seconds, 0.1)
                guard let buffer = makePixelBuffer(pool: pool, current: cgImages[index], next: index < cgImages.count - 1 ? cgImages[index + 1] : nil, progress: transition, frameProgress: progress, width: width, height: height) else {
                    throw NSError(domain: "PitchVideo", code: 4)
                }
                adaptor.append(buffer, withPresentationTime: CMTime(value: frameNumber, timescale: fps))
                frameNumber += 1
            }
        }
        input.markAsFinished()
        await writer.finishWriting()
        guard writer.status == .completed else { throw writer.error ?? NSError(domain: "PitchVideo", code: 5) }

        let composition = AVMutableComposition()
        let visualAsset = AVURLAsset(url: silentURL)
        let visualTracks = try await visualAsset.loadTracks(withMediaType: .video)
        guard let sourceVideo = visualTracks.first,
              let videoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
            throw NSError(domain: "PitchVideo", code: 6)
        }
        let visualDuration = try await visualAsset.load(.duration)
        try videoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: visualDuration), of: sourceVideo, at: .zero)

        guard let audioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
            throw NSError(domain: "PitchVideo", code: 7)
        }
        var cursor = CMTime.zero
        for (index, url) in audioURLs.enumerated() {
            let asset = AVURLAsset(url: url)
            let tracks = try await asset.loadTracks(withMediaType: .audio)
            if let track = tracks.first {
                let duration = try await asset.load(.duration)
                try audioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: track, at: cursor)
            }
            cursor = CMTimeAdd(cursor, CMTime(seconds: durations[index], preferredTimescale: 600))
        }

        guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
            throw NSError(domain: "PitchVideo", code: 8)
        }
        try await exporter.export(to: finalURL, as: .mp4)
        print("Created \(finalURL.path)")
        print(String(format: "Duration: %.1f seconds", CMTimeGetSeconds(composition.duration)))
    }
}
