using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;

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
}
