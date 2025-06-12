using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VnPayController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        public VnPayController(IVnPayService vnPayService)
        {

            _vnPayService = vnPayService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePaymentUrlVnpay(PaymentInformationModel model)
        {
            var url = _vnPayService.CreatePaymentUrl(model, HttpContext);

            return Ok(new PaymentUrlResponse { Url = url });
        }


        [HttpGet("return")]
        public async Task<IActionResult> PaymentCallbackVnpay()
        {
            var response = await _vnPayService.PaymentExecute(Request.Query);

            return Ok(response);
        }
    }

    public class PaymentInformationModel
    {
        public string OrderType { get; set; }
        public double Amount { get; set; }
        public string OrderDescription { get; set; }
        public string Name { get; set; }
    }
    public class PaymentResponseModel
    {
        public string OrderDescription { get; set; }
        public string TransactionId { get; set; }
        public string OrderId { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentId { get; set; }
        public bool Success { get; set; }
        public string Token { get; set; }
        public string VnPayResponseCode { get; set; }
        public string UserId { get; set; }
        public string Tier { get; set; }
    }

    public class PaymentUrlResponse
    {
        public string Url { get; set; }
    }
}
