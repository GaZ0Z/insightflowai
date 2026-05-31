import os
import json
import logging
import mailtrap as mt
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insightflow-backend")

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client = None

if supabase_url and supabase_key:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully on backend.")
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {str(e)}")
else:
    logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Supabase inserts will be skipped.")

# Configure GenAI Client
client = None
if api_key and api_key != "your_gemini_key_here":
    logger.info("Initializing Google GenAI Client with configured API key.")
    try:
        client = genai.Client(api_key=api_key)
    except Exception as err:
        logger.error(f"Error initializing GenAI Client: {str(err)}")
else:
    logger.warning("Gemini API key is not configured or is a placeholder. Server will run in fallback sandbox mode.")

app = FastAPI(title="InsightFlow AI Backend Proxy")

# Enable global CORS access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CampaignEmail(BaseModel):
    customerName: str
    email: str
    subject: str
    body: str

class StrategyRequest(BaseModel):
    orders: List[Dict[str, Any]]

class SendCampaignRequest(BaseModel):
    customerName: str
    email: str
    subject: str
    body: str
    userEmail: str
    productName: Optional[str] = None
    productImageUrl: Optional[str] = None
    htmlBody: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "online", "message": "InsightFlow Autonomous Marketing proxy is online."}

@app.get("/api/mock-shopify-orders")
def get_shopify_orders():
    """
    Generates 10-15 mock shopify orders dynamically using datetime.now()
    to keep inactivity days counts accurate.
    """
    now = datetime.now()
    
    # Mock data definitions (customer names, spent totals, offset in days)
    mock_customers = [
        {"customerName": "John Doe", "email": "john.doe@example.com", "totalSpent": 450.00, "daysOffset": 15, "productName": "Waterproof Running Shoes", "returnCount": 0, "abandonedCartValue": 0.0, "supportTicketTopic": "None"}, 
        {"customerName": "Alice Smith", "email": "alice.smith@example.com", "totalSpent": 1250.50, "daysOffset": 110, "productName": "Wireless Noise-Cancelling Headphones", "returnCount": 2, "abandonedCartValue": 149.99, "supportTicketTopic": "Sizing issues"}, 
        {"customerName": "Robert Jones", "email": "robert.jones@example.com", "totalSpent": 85.00, "daysOffset": 45, "productName": "Minimalist Leather Wallet", "returnCount": 0, "abandonedCartValue": 45.00, "supportTicketTopic": "None"}, 
        {"customerName": "Sarah Connor", "email": "sarah.c@example.com", "totalSpent": 3200.00, "daysOffset": 120, "productName": "Tactical LED Flashlight", "returnCount": 1, "abandonedCartValue": 350.00, "supportTicketTopic": "Shipping delay"}, 
        {"customerName": "Emma Watson", "email": "emma.watson@example.com", "totalSpent": 620.00, "daysOffset": 22, "productName": "Organic Lavender Candle", "returnCount": 0, "abandonedCartValue": 0.0, "supportTicketTopic": "None"}, 
        {"customerName": "David Miller", "email": "d.miller@example.com", "totalSpent": 190.00, "daysOffset": 95, "productName": "Ergonomic Mesh Office Chair", "returnCount": 0, "abandonedCartValue": 180.00, "supportTicketTopic": "Product defect"}, 
        {"customerName": "James Wilson", "email": "james.w@example.com", "totalSpent": 1500.00, "daysOffset": 80, "productName": "Stainless Steel Water Bottle", "returnCount": 0, "abandonedCartValue": 0.0, "supportTicketTopic": "None"}, 
        {"customerName": "Linda Taylor", "email": "linda.t@example.com", "totalSpent": 410.00, "daysOffset": 150, "productName": "Premium Ceramic Coffee Mug", "returnCount": 3, "abandonedCartValue": 0.0, "supportTicketTopic": "Sizing issues"}, 
        {"customerName": "Michael Thomas", "email": "m.thomas@example.com", "totalSpent": 300.00, "daysOffset": 200, "productName": "Smart Fitness Activity Tracker", "returnCount": 0, "abandonedCartValue": 120.00, "supportTicketTopic": "None"}, 
        {"customerName": "Jessica Davis", "email": "jessica.d@example.com", "totalSpent": 780.00, "daysOffset": 10, "productName": "Yoga Mat with Carrying Strap", "returnCount": 0, "abandonedCartValue": 0.0, "supportTicketTopic": "None"}, 
        {"customerName": "William Garcia", "email": "william.g@example.com", "totalSpent": 110.00, "daysOffset": 105, "productName": "Compact Travel Umbrella", "returnCount": 1, "abandonedCartValue": 25.00, "supportTicketTopic": "Shipping delay"}, 
        {"customerName": "Mary Rodriguez", "email": "mary.rod@example.com", "totalSpent": 2250.00, "daysOffset": 5, "productName": "Vegan Leather Laptop Sleeve", "returnCount": 0, "abandonedCartValue": 0.0, "supportTicketTopic": "None"}, 
    ]
    
    orders = []
    for c in mock_customers:
        last_date = now - timedelta(days=c["daysOffset"])
        seed = c["customerName"].replace(" ", "")
        orders.append({
            "customerName": c["customerName"],
            "email": c["email"],
            "lastOrderDate": last_date.strftime("%Y-%m-%d"),
            "totalSpent": c["totalSpent"],
            "daysInactive": c["daysOffset"],
            "isAtRisk": c["daysOffset"] > 90,
            "productName": c["productName"],
            "productImageUrl": f"https://picsum.photos/seed/{seed}/300/300",
            "returnCount": c["returnCount"],
            "abandonedCartValue": c["abandonedCartValue"],
            "supportTicketTopic": c["supportTicketTopic"]
        })
        
    return orders

@app.post("/api/generate-strategy")
async def generate_strategy(request: StrategyRequest):
    """
    Takes shopify orders, filters 'At-Risk' customers (>90 days inactive),
    and asks Gemini 2.5 Flash to analyze customer friction points (support tickets, returns, abandoned carts)
    and generate personalized, problem-solving emails in HTML.
    """
    logger.info("Received request to generate marketing emails.")
    
    # Filter At-Risk customers
    at_risk_customers = [o for o in request.orders if o.get("isAtRisk") is True]
    
    if not at_risk_customers:
        logger.info("No At-Risk customers identified.")
        return {"emails": []}
        
    logger.info(f"Identified {len(at_risk_customers)} At-Risk customers.")

    # Sandbox / Local fallback generation if Gemini API key is missing
    if not client:
        logger.info("Returning mock emails due to missing Gemini SDK client.")
        fallback_emails = []
        for idx, c in enumerate(at_risk_customers):
            # Deduce problem
            problem = "General Inactivity"
            sol_text = "We noticed you haven't visited us in a while."
            if c.get("supportTicketTopic") and c.get("supportTicketTopic") != "None":
                problem = f"Support ticket issue: '{c.get('supportTicketTopic')}'"
                sol_text = f"We apologize for the recent support friction regarding '{c.get('supportTicketTopic')}'. We've resolved the issue and want to make it up to you."
            elif c.get("returnCount", 0) > 1:
                problem = f"Frequent product returns ({c.get('returnCount')} returns)"
                sol_text = "We noticed you had some returns recently. We want to ensure you find the perfect match with absolute confidence next time."
            elif c.get("abandonedCartValue", 0) > 0:
                problem = f"Abandoned shopping cart worth ${c.get('abandonedCartValue'):.2f}"
                sol_text = f"We noticed you left some items behind in your cart! Here is a little nudge to help you complete your purchase."

            html_body = f"""
            <p>Hi {c['customerName'].split(' ')[0]},</p>
            <p>{sol_text}</p>
            <p>To show our appreciation, here is a special <strong>15% OFF coupon</strong> for your next checkout: <strong>WELCOMEBACK15</strong></p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="{c['productImageUrl']}" alt="{c['productName']}" style="max-width: 250px; border-radius: 8px; border: 1px solid #e2e8f0; padding: 4px;" />
                <div style="font-weight: bold; font-size: 14px; margin-top: 8px; color: #475569;">{c['productName']}</div>
            </div>
            <p>Best regards,<br>The Support & Success Team</p>
            """
            
            fallback_emails.append({
                "customerName": c["customerName"],
                "email": c["email"],
                "subject": f"A special message regarding your experience, {c['customerName'].split(' ')[0]}!",
                "body": f"We identified a custom cohort issue: {problem}. HTML template compiled below.",
                "productName": c.get("productName"),
                "productImageUrl": c.get("productImageUrl"),
                "identifiedProblem": problem,
                "htmlBody": html_body
            })
        return {"emails": fallback_emails}

    try:
        # Prompt telling Gemini to write customized emails and return valid JSON
        prompt = f"""
        Act as an empathetic expert marketing and customer support copywriter.
        Analyze the following list of at-risk e-commerce customers, looking specifically at their daysInactive, supportTicketTopic, returnCount, and abandonedCartValue.

        For each customer:
        1. Identify their primary 'Problem' or friction point (e.g. support sizing issue, shipping delay, product defect, abandoned high-value cart, or general inactivity).
        2. Draft a highly tailored, empathetic solution-oriented win-back email that addresses this exact problem directly. 
        3. Include a 15% discount code (WELCOMEBACK15) to help win them back.
        4. Integrate their abandoned/purchased product name and image (using <img src="productImageUrl" style="max-width: 250px; display: block; margin: 15px auto; border-radius: 8px;" />) in the HTML body structure.
        
        Customers to analyze:
        {json.dumps(at_risk_customers, indent=2)}

        You MUST respond with a valid JSON object matching this schema:
        {{
            "emails": [
                {{
                    "customerName": "string (exactly matches input)",
                    "email": "string (exactly matches input)",
                    "identifiedProblem": "string (Short, clear summary of their deduced problem, e.g., 'Frustrated by sizing return issues')",
                    "subject": "string (empathetic, click-worthy subject line)",
                    "htmlBody": "string (Rich HTML email body containing layout styles, paragraphs, and the product img tag)"
                }}
            ]
        }}
        Do not output any conversational wrapper text. Return only the JSON object.
        """

        logger.info("Calling Gemini 2.5 Flash with strict JSON response configuration for problem-solving marketing.")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        if not response.text:
            raise Exception("Gemini model returned empty text.")

        # Parse JSON output from model text
        parsed_response = json.loads(response.text.strip())
        
        # Inject productName and productImageUrl from the input customer profile, ensure body has fallback
        customer_lookup = {c["email"]: c for c in at_risk_customers}
        for email_item in parsed_response.get("emails", []):
            email_addr = email_item.get("email")
            if email_addr in customer_lookup:
                email_item["productName"] = customer_lookup[email_addr].get("productName")
                email_item["productImageUrl"] = customer_lookup[email_addr].get("productImageUrl")
                
            email_item["body"] = email_item.get("body") or "HTML-only campaign draft. Review visual output below."
                
        return parsed_response

    except Exception as e:
        logger.error(f"Error calling Gemini: {str(e)}")
        # Dynamic fallback if API fails
        logger.info("Falling back to local email compilation.")
        fallback_emails = []
        for c in at_risk_customers:
            problem = "General Inactivity"
            sol_text = "We noticed you haven't visited us in a while."
            if c.get("supportTicketTopic") and c.get("supportTicketTopic") != "None":
                problem = f"Support ticket issue: '{c.get('supportTicketTopic')}'"
                sol_text = f"We apologize for the recent support friction regarding '{c.get('supportTicketTopic')}'. We've resolved the issue and want to make it up to you."
            elif c.get("returnCount", 0) > 1:
                problem = f"Frequent product returns ({c.get('returnCount')} returns)"
                sol_text = "We noticed you had some returns recently. We want to ensure you find the perfect match with absolute confidence next time."
            elif c.get("abandonedCartValue", 0) > 0:
                problem = f"Abandoned shopping cart worth ${c.get('abandonedCartValue'):.2f}"
                sol_text = f"We noticed you left some items behind in your cart! Here is a little nudge to help you complete your purchase."

            html_body = f"""
            <p>Hi {c['customerName'].split(' ')[0]},</p>
            <p>{sol_text}</p>
            <p>To show our appreciation, here is a special <strong>15% OFF coupon</strong> for your next checkout: <strong>WELCOMEBACK15</strong></p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="{c['productImageUrl']}" alt="{c['productName']}" style="max-width: 250px; border-radius: 8px; border: 1px solid #e2e8f0; padding: 4px;" />
                <div style="font-weight: bold; font-size: 14px; margin-top: 8px; color: #475569;">{c['productName']}</div>
            </div>
            <p>Best regards,<br>The Support & Success Team</p>
            """
            fallback_emails.append({
                "customerName": c["customerName"],
                "email": c["email"],
                "subject": f"Special discount for {c['customerName'].split(' ')[0]}!",
                "body": f"We identified a custom cohort issue: {problem}. HTML template compiled below.",
                "productName": c.get("productName"),
                "productImageUrl": c.get("productImageUrl"),
                "identifiedProblem": problem,
                "htmlBody": html_body
            })
        return {"emails": fallback_emails}

@app.post("/api/send-campaign")
async def send_campaign(request: SendCampaignRequest):
    """
    Connects to Mailtrap API using the official SDK to dispatch the HTML email.
    Forces sender to 'hello@demomailtrap.co' and recipient to the verified TEST_RECIPIENT_EMAIL
    to support demo accounts, appending the original recipient email to the text body and HTML.
    """
    MAILTRAP_API_TOKEN = os.getenv("MAILTRAP_API_TOKEN")
    TEST_RECIPIENT_EMAIL = os.getenv("TEST_RECIPIENT_EMAIL")

    # Check for placeholders or missing credentials
    is_placeholder = (
        not MAILTRAP_API_TOKEN or 
        MAILTRAP_API_TOKEN == "your_mailtrap_api_token" or 
        not TEST_RECIPIENT_EMAIL or 
        TEST_RECIPIENT_EMAIL == "your_verified_email_here"
    )

    if is_placeholder:
        logger.info(f"[MAILTRAP SIMULATION] Sent HTML email to {request.customerName} ({request.email}). Subject: {request.subject}")
        return {
            "status": "simulated",
            "message": f"HTML Email successfully simulated for {request.customerName} (Product: {request.productName}). Configure real MAILTRAP_API_TOKEN and TEST_RECIPIENT_EMAIL in backend/.env to send live."
        }

    try:
        # Create MailtrapClient
        client = mt.MailtrapClient(token=MAILTRAP_API_TOKEN)

        # Build custom body that includes the original mock customer recipient email
        debug_footer = (
            f"\n\n--------------------------------------------------\n"
            f"[InsightFlow AI Demo Routing Details]\n"
            f"Original Recipient Name: {request.customerName}\n"
            f"Original Recipient Email: {request.email}\n"
            f"--------------------------------------------------"
        )
        full_body = request.body + debug_footer

        # Create beautiful HTML template
        if request.htmlBody:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>{request.subject}</title>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #f1f5f9;
                        margin: 0;
                        padding: 20px;
                        color: #334155;
                    }}
                    .container {{
                        max-width: 600px;
                        background-color: #ffffff;
                        margin: 0 auto;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    }}
                    .header {{
                        background-color: #0f172a;
                        padding: 25px 20px;
                        text-align: center;
                        border-bottom: 3px solid #2596be;
                    }}
                    .header h2 {{
                        margin: 0;
                        color: #ffffff;
                        font-size: 22px;
                        letter-spacing: -0.025em;
                    }}
                    .content {{
                        padding: 30px 25px;
                        line-height: 1.6;
                        font-size: 15px;
                    }}
                    .footer {{
                        background-color: #f8fafc;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                        font-size: 11px;
                        color: #64748b;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>InsightFlow AI Campaign</h2>
                    </div>
                    <div class="content">
                        <div style="color: #334155;">{request.htmlBody}</div>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">This is an automated campaign dispatch simulated by InsightFlow AI.</p>
                        <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 10px; background-color: #e2e8f0; padding: 10px; border-radius: 6px; text-align: left; color: #475569; line-height: 1.4;">
                            <strong>[InsightFlow Demo Routing]</strong><br>
                            Original Recipient Name: {request.customerName}<br>
                            Original Recipient Email: {request.email}
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
        else:
            formatted_body_html = request.body.replace("\n", "<br>")
            product_section = ""
            if request.productName:
                image_section = ""
                if request.productImageUrl:
                    image_section = (
                        f'<div style="text-align: center; margin: 20px 0;">'
                        f'<img src="{request.productImageUrl}" alt="{request.productName}" '
                        f'style="max-width: 250px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; padding: 4px;" />'
                        f'</div>'
                    )
                
                product_section = f"""
                <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; margin: 25px 0;">
                    <h4 style="margin-top: 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Featured Collection Abandoned Item</h4>
                    <div style="font-weight: bold; color: #0f172a; font-size: 16px; margin-bottom: 12px;">{request.productName}</div>
                    {image_section}
                    <div style="text-align: center; margin-top: 20px;">
                        <div style="background-color: #2596be; color: #ffffff; font-weight: 800; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 15px; letter-spacing: 0.02em; border: 1px solid #2082a5;">
                            15% OFF Coupon: WELCOMEBACK15
                        </div>
                    </div>
                </div>
                """

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>{request.subject}</title>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #f1f5f9;
                        margin: 0;
                        padding: 20px;
                        color: #334155;
                    }}
                    .container {{
                        max-width: 600px;
                        background-color: #ffffff;
                        margin: 0 auto;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    }}
                    .header {{
                        background-color: #0f172a;
                        padding: 25px 20px;
                        text-align: center;
                        border-bottom: 3px solid #2596be;
                    }}
                    .header h2 {{
                        margin: 0;
                        color: #ffffff;
                        font-size: 22px;
                        letter-spacing: -0.025em;
                    }}
                    .content {{
                        padding: 30px 25px;
                        line-height: 1.6;
                        font-size: 15px;
                    }}
                    .footer {{
                        background-color: #f8fafc;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                        font-size: 11px;
                        color: #64748b;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>InsightFlow AI Campaign</h2>
                    </div>
                    <div class="content">
                        <div style="margin-top: 0; white-space: pre-line; color: #334155;">{formatted_body_html}</div>
                        {product_section}
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">This is an automated campaign dispatch simulated by InsightFlow AI.</p>
                        <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 10px; background-color: #e2e8f0; padding: 10px; border-radius: 6px; text-align: left; color: #475569; line-height: 1.4;">
                            <strong>[InsightFlow Demo Routing]</strong><br>
                            Original Recipient Name: {request.customerName}<br>
                            Original Recipient Email: {request.email}
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """

        # Create mail envelope with both text and html
        mail = mt.Mail(
            sender=mt.Address(email="hello@demomailtrap.co", name="InsightFlow AI"),
            to=[mt.Address(email=TEST_RECIPIENT_EMAIL, name=request.customerName)],
            subject=request.subject,
            text=full_body,
            html=html_content,
        )

        logger.info(f"Delivering HTML email via Mailtrap SDK to verified test email: {TEST_RECIPIENT_EMAIL}...")
        client.send(mail)

        logger.info("HTML Email delivered successfully via Mailtrap.")
        return {
            "status": "sent",
            "message": f"HTML Email successfully dispatched to verified testing inbox ({TEST_RECIPIENT_EMAIL})!"
        }

    except Exception as err:
        logger.error(f"Mailtrap SDK HTML delivery failed: {str(err)}")
        raise HTTPException(
            status_code=502,
            detail=f"Mailtrap API HTML sending failed: {str(err)}"
        )

@app.get("/api/shopify/auth")
def shopify_auth(shop: str):
    """
    Initiates the Shopify OAuth 2.0 flow.
    Redirects the user to the Shopify authorization screen.
    """
    SHOPIFY_CLIENT_ID = os.getenv("SHOPIFY_CLIENT_ID", "placeholder_client_id")
    SHOPIFY_REDIRECT_URI = os.getenv("SHOPIFY_REDIRECT_URI", "placeholder_redirect_uri")
    
    if not shop:
        raise HTTPException(status_code=400, detail="Missing 'shop' query parameter.")
    
    # Sanitize shop name to ensure it's a valid myshopify.com domain if it doesn't end with it
    if not shop.endswith(".myshopify.com") and "." not in shop:
        shop = f"{shop}.myshopify.com"
        
    scopes = "read_orders,read_customers,read_products"
    auth_url = (
        f"https://{shop}/admin/oauth/authorize?"
        f"client_id={SHOPIFY_CLIENT_ID}&"
        f"scope={scopes}&"
        f"redirect_uri={SHOPIFY_REDIRECT_URI}"
    )
    
    logger.info(f"Redirecting merchant to Shopify authorization URL: {auth_url}")
    return RedirectResponse(auth_url)

@app.get("/api/shopify/callback")
async def shopify_callback(shop: str, code: str, hmac: str):
    """
    Callback endpoint where Shopify sends the authorization code.
    Exchanges the authorization code for a permanent access token,
    saves the access token to Supabase database user_integrations,
    and redirects the user back to the frontend integration step.
    """
    SHOPIFY_CLIENT_ID = os.getenv("SHOPIFY_CLIENT_ID", "placeholder_client_id")
    SHOPIFY_CLIENT_SECRET = os.getenv("SHOPIFY_CLIENT_SECRET", "placeholder_client_secret")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://insightflowai-nine.vercel.app/")
    
    if not shop or not code:
        raise HTTPException(status_code=400, detail="Missing 'shop' or 'code' query parameters.")
        
    url = f"https://{shop}/admin/oauth/access_token"
    payload = {
        "client_id": SHOPIFY_CLIENT_ID,
        "client_secret": SHOPIFY_CLIENT_SECRET,
        "code": code
    }
    
    access_token = None
    try:
        logger.info(f"Exchanging temporary OAuth code for access token with shop: {shop}")
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
        else:
            logger.error(f"Failed to exchange token from Shopify: {response.text}")
    except Exception as exc:
        logger.error(f"Shopify OAuth code exchange failed: {str(exc)}")
        
    # If access_token exchange succeeded, insert to user_integrations table
    if access_token:
        try:
            if supabase_client:
                logger.info(f"Inserting shop_domain={shop} and access_token to user_integrations table...")
                supabase_client.table("user_integrations").insert({
                    "shop_domain": shop,
                    "access_token": access_token
                }).execute()
                logger.info("Successfully inserted integration row in Supabase database.")
            else:
                logger.warning("Supabase client not initialized. Skipping database insertion.")
        except Exception as exc:
            logger.error(f"Failed to insert user_integration in Supabase: {str(exc)}")
            print(f"Failed to insert user_integration in Supabase: {str(exc)}")
            
    # Redirect user back to the frontend integration step
    redirect_target = f"{FRONTEND_URL.rstrip('/')}/"
    logger.info(f"Shopify OAuth callback process completed. Redirecting to: {redirect_target}")
    return RedirectResponse(url=redirect_target)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
