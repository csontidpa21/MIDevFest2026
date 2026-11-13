import Foundation
import AVFoundation
import AppKit
@main struct Verify {
 static func main() async throws {
  let base="video-pitch/ibm-devfest"
  let path=CommandLine.arguments[1]
  let asset=AVURLAsset(url:URL(fileURLWithPath:path))
  let dur=CMTimeGetSeconds(try await asset.load(.duration))
  let video=try await asset.loadTracks(withMediaType:.video)
  let audio=try await asset.loadTracks(withMediaType:.audio)
  guard dur <= 180, let track=video.first, !audio.isEmpty else { fatalError("Invalid media duration or missing tracks") }
  let size=try await track.load(.naturalSize)
  let generator=AVAssetImageGenerator(asset:asset);generator.appliesPreferredTrackTransform=true
  for t in [5,20,35,45,60,80,100,130,145,155,164,172] {
   let result=try await generator.image(at:CMTime(seconds:Double(t),preferredTimescale:600))
   let bitmap=NSBitmapImageRep(cgImage:result.image)
   try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:"\(base)/qa-\(t).png"))
  }
  var levels:[[String:Any]]=[]
  for i in 1...12 {
   let file=try AVAudioFile(forReading:URL(fileURLWithPath:String(format:"%@/narration-%02d.aiff",base,i)))
   let buffer=AVAudioPCMBuffer(pcmFormat:file.processingFormat,frameCapacity:AVAudioFrameCount(file.length))!
   try file.read(into:buffer)
   guard let samples=buffer.floatChannelData?[0] else {fatalError("No readable audio")}
   var sum=0.0;var peak=0.0
   for j in 0..<Int(buffer.frameLength){let v=Double(samples[j]);sum+=v*v;peak=max(peak,abs(v))}
   let rms=sqrt(sum/Double(buffer.frameLength));guard rms>0.001 else {fatalError("Silent narration")}
   levels.append(["segment":i,"seconds":Double(file.length)/file.processingFormat.sampleRate,"rms":rms,"peak":peak])
  }
  let report:[String:Any]=["durationSeconds":dur,"width":size.width,"height":size.height,"audioTracks":audio.count,"videoTracks":video.count,"sampledVideoFrames":12,"narrationLevels":levels]
  let data=try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys])
  try data.write(to:URL(fileURLWithPath:"\(base)/verification.json"));print(String(decoding:data,as:UTF8.self))
 }
}
