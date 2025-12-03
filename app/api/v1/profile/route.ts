import { NextRequest, NextResponse } from "next/server";
import FormDataNode from "form-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function PATCH(request: NextRequest) {
  try {
    const incomingFormData = await request.formData();
    
    // Get all cookies
    const allCookies = request.cookies.getAll();
    console.log("🔐 DEBUG: All available cookies:", allCookies.map(c => ({ 
      name: c.name, 
      value: c.value.substring(0, 30) + (c.value.length > 30 ? '...' : '')
    })));
    
    // Try multiple cookie names for compatibility
    const jwt = request.cookies.get("jwt")?.value || 
                request.cookies.get("JWT")?.value ||
                request.cookies.get("token")?.value;

    console.log("🔐 Checking authentication...");
    console.log("   - Cookie jwt present:", !!jwt);
    console.log("   - Cookie count:", allCookies.length);

    if (!jwt) {
      console.error("❌ No JWT cookie found");
      console.error("   Available cookies:", allCookies.map(c => c.name).join(", "));
      
      // If no JWT but there are cookies, log them for debugging
      if (allCookies.length > 0) {
        console.error("   DEBUG: Cookie details:");
        allCookies.forEach(c => {
          console.error(`     - ${c.name}: ${c.value.substring(0, 50)}...`);
        });
      }
      
      return NextResponse.json({ 
        error: "Unauthorized",
        details: "No authentication cookie found",
        availableCookies: allCookies.map(c => c.name),
        hint: "The jwt cookie is not being sent from the browser. Check if you're logged in."
      }, { status: 401 });
    }

    console.log("📤 Forwarding profile update to backend");
    console.log("   - name:", incomingFormData.get("name"));
    console.log("   - language:", incomingFormData.get("language"));
    
    const picture = incomingFormData.get("picture");
    console.log("   - picture:", picture ? `Yes (${picture instanceof File ? picture.name : 'unknown'})` : "No");

    // Create form-data for Node.js
    const formData = new FormDataNode();
    formData.append("name", incomingFormData.get("name") as string);
    formData.append("language", incomingFormData.get("language") as string);

    if (picture && picture instanceof File) {
      const buffer = Buffer.from(await picture.arrayBuffer());
      formData.append("picture", buffer, {
        filename: picture.name,
        contentType: picture.type,
      });
      console.log("   ✅ Picture converted to buffer:", picture.name, picture.type, buffer.length, "bytes");
    }

    console.log("   📋 Sending request to:", `${API_BASE_URL}/api/v1/users/profile`);

    const bodyBuffer = formData.getBuffer();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: "PATCH",
      headers: {
        Cookie: `jwt=${jwt}`,
        ...formData.getHeaders(),
      },
      body: bodyBuffer as any,
    });

    const data = await response.json();
    console.log("📥 Backend response:", response.status, data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
